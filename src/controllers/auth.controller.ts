import {Database} from 'arangojs';
import bcrypt from 'bcrypt';
import {NextFunction, Request, Response} from 'express';
import passport from 'passport';
import {getDbConn} from '../config/arango.config';
import {logger} from '../config/logger/logger';
import {getVertexByPropertyName, updateVertex} from '../helpers/db-utils';
import {Person, RawPerson} from '../models/person';
import {RequestError} from '../models/request-error';
import {DocCollections} from '../typings/project-types';
import {VertexController} from './vertex.controller';

const db: Database = getDbConn();

export class AuthController extends VertexController {

	constructor() {
		super();
	}

	async findPersonByEmail(email: string) {
		try {
			return await this.findVertexByProperty('email', email, DocCollections.PEOPLE);
		}catch (err) {
			logger.error(`Error occurred getting person with email ${email}: ${err.message}`);
		}
	}

	/**
	 * Compare the typedPassword with the hashed password
	 * @param typedPassword {string}
	 * @return {boolean}
	 */
	comparePassword(rawPerson: RawPerson, typedPassword: string) {
		if (typedPassword && rawPerson) {
			return bcrypt.compareSync(typedPassword, rawPerson.password);
		}
		const errorMsg = !typedPassword ? 'You must provide a typedPassword to compare with' : 'No person provided';
		throw new Error(errorMsg);
	}

	/**
	 * Verify if 2 plain text passwords match
	 * @param password1 {string} unencrypted password (i.e. value of the password field)
	 * @param password2 {string} unencrypted password (i.e. value of the verify_password field)
	 */
	plainPasswordsMatch(password1: string, password2: string): boolean {
		return password1 === password2;
	}

	/**
	 * Create an encrypted password
	 * @param typedPassword {string} plain text password (i.e. value of the password field)
	 */
	createPassword(typedPassword: string) {
		if (typedPassword) {
			const salt = bcrypt.genSaltSync(13);
			return bcrypt.hashSync(typedPassword, salt);
		}
		throw new Error('Missing Parameters, typedPassword');
	}

	/**
	 * Login a user and send the user object
	 * @param req {Request}
	 * @param res {Response}
	 * @param next {NextFunction}
	 * @method {POST}
	 */
	login(req: Request, res: Response, next: NextFunction) {
		passport.authenticate('local', (err: Error, user: RawPerson, info: any) => {
			if (err) {
				return next(err);
			}
			if (user) {
				const person = new Person(user);
				req.logIn(person, (err: Error) => {
					if (err) {
						return next(err);
					}
					const {first_name, last_name, email} = person;
					logger.info(`Logged In: ${first_name} ${last_name}: <${email}>`);
					return res.send(person);
				});
			}else{
				return res.status(401).send(info);
			}
		})(req, res, next);
	}

	/**
	 * Logout a user and redirect to the login page
	 * @param req {Request}
	 * @param res {Response}
	 * @method {GET}
	 */
	logout(req: Request, res: Response) {
		if (req.user) {
			const {first_name, last_name, email} = req.user as Person;
			req.logout();
			req.session.destroy((err) => {
				if (err) {
					return res.status(500).send(err);
				}
				res.clearCookie(process.env.WEB_SESS_NAME);
				logger.info(`Logged Out: ${first_name} ${last_name}: <${email}>`);
				res.send({message: 'Success'});
			});
		}else{
			res.send({message: 'Not Authenticated'});
		}
	}

	/**
	 * Register a person and send the IPersonDocument or an error message
	 * @param req {Request}
	 * @param res {Response}
	 * @method {POST}
	 */
	async register(req: Request, res: Response) {
		const {first_name, last_name, email, password, verify_password} = req.body;
		const displayName = `${first_name} ${last_name}: <${email}>`;
		const hashedPassword = this.createPassword(password);
		const person: Person = new Person({
			first_name,
			last_name,
			email: email ? email.toLowerCase() : email,
			password: hashedPassword
		});
		if (!this.plainPasswordsMatch(password, verify_password)) {
			res.status(400).send({message: `Passwords do not match`});
		}else if(!this.isEmail(email)) {
			res.status(400).send({message: 'Invalid email address'});
		}else{
			try {
				const existingPerson = await this.findPersonByEmail(email.toLowerCase());
				if (!existingPerson) {
					const newPerson = await this.createVertex(person, DocCollections.PEOPLE);
					if (newPerson) {
						logger.info(`Person created for ${displayName} with id ${newPerson['_key']}`);
						req.login(newPerson, (err) => {
							if (err) {
								throw err;
							}
							res.send(newPerson);
							logger.info(`Registered User: ${displayName} with id ${newPerson['_key']}`)
						});
					} else {
						res.status(400).send({message: `Error Occurred registering a new user for ${displayName}`});
					}
				} else {
					res.status(400).send({message: `User with email address ${existingPerson.email} already exists!`});
				}
			}catch (err) {
				const msg = `Error occurred registering a new user for ${displayName}: ${err.message}`;
				logger.error(msg);
				res.status(400).send(err);
			}
		}
	}

	/**
	 * Check if a string's pattern matches that of an email address
	 * @param val {string}
	 */
	isEmail(val: string): boolean {
		if (!val) {
			throw new Error('You must provide a value');
		}else{
			const emailRegex: RegExp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
			return emailRegex.test(val);
		}
	}

	/**
	 * Reset a forgotten password
	 * @param requestBody {{email: string, new_password: string, verify_password: string}}
	 */
	async forgottenPassword(requestBody: any) {
		if (requestBody.email) {
			const user: RawPerson = await getVertexByPropertyName('email', requestBody.email, DocCollections.PEOPLE);
			if (user && this.plainPasswordsMatch(requestBody.new_password, requestBody.verify_password)) {
				const newPw = this.createPassword(requestBody.new_password);
				return await updateVertex(user._key, DocCollections.PEOPLE, {password: newPw});
			}else{
				if (!user) {
					const err = new RequestError(`User with email address ${requestBody.email} does not exist`, 400);
					throw err;
				}else {
					const err = new RequestError(`Passwords do not match`, 400);
					throw err;
				}
			}
		}
	}

	/**
	 * Change a password
	 * @param req
	 */
	async changePassword(req: Request) {
		if (req.user) {
			const {new_password, verify_password, password} = req.body;
			if (this.plainPasswordsMatch(new_password, verify_password) && this.comparePassword((req.user as RawPerson), password)) {
				const newPw = this.createPassword(new_password);
				return updateVertex((req.user as RawPerson)._key, DocCollections.PEOPLE, {password: newPw});
			}else{
				throw new RequestError(`Passwords do not match`, 400);
			}
		}else{
			throw new RequestError(`Not authenticated`, 401);
		}
	}

}
