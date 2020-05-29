import {AuthController} from '../controllers/auth.controller';
import {Application} from 'express';
import {RawPerson} from '../models/person';
import passport from 'passport';
import passportLocal from 'passport-local';
import {logger} from './logger/logger';

export const initPassport = (app: Application) => {
	app.use(passport.initialize());
	app.use(passport.session());

	passport.serializeUser(function(user_id: string, done: any) {
		done(null, user_id);
	});

	passport.deserializeUser(function(user_id: string, done: any) {
		done(null, user_id);
	});

	/**
	 * Passport middleware. This is called from `passport.authenticate()`.
	 * Will get the user from the database and compare passwords
	 * the done function accepts 3 arguments: error, truthy/false, {message: string}
	 * if false is provided (2nd arg) it means the request failed. truthy is success
	 * the message is posted as a flash message
	 */
	 passport.use(new passportLocal.Strategy({usernameField: 'email'}, async (email: string, password: string, done: any) => {
	 	try {
			const authController: AuthController = new AuthController();
	 		const rawPerson: RawPerson = await authController.findPersonByEmail(email);
	 		if (rawPerson) {
	 			if (authController.comparePassword(rawPerson, password)) {
	 				done(null, rawPerson)
				}else{
	 				done(null, false, {message: 'Incorrect Password'});
				}
			}else{
	 			done(null, false, {
	 				message: `Email ${email} not found`,
					code: '02'
				});
			}
		}catch (err) {
	 		logger.error(`Error occurred in passport middleware: ${err.message}`);
	 		done(err, false, {message: err.message});
		}
	}));
};
