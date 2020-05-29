import {LogLevels} from './project-types';
import {getDbConn} from './config/arango.config';
import {initPassport} from './config/passport';
import {requestLogger} from './config/logger/request-logger-middleware';
import swaggerDocs from './config/swaggerDoc';
import express, {Request, Response, Application} from 'express';
import session from 'express-session';
import flash from 'express-flash';
import {logger} from './config/logger/logger';
import * as dotenv from 'dotenv';
import {apiRouter, branchRouter, repositoryRouter, reviewRouter, authRouter, peopleRouter} from './routes';

dotenv.config();
/**
 * Setup the application
 */
const app: Application = express();
const port = parseInt(process.env.WEB_PORT);

/**
 * express middleware
 */
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(flash());

/**
 * Setup the ArangoDb store
 */
const db = getDbConn();
const ArangoStore = require('connect-arango')(session);
const arangoStoreOpts = {
	db: process.env.DB_NAME,
	collection: 'sessions',
	host: process.env.DB_HOST,
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD
};
const arangoStore = new ArangoStore(arangoStoreOpts, () => {});

/**
 * express-session middleware. Sets up the cookie and how sessions are stored
 */
app.use(session({
	store: arangoStore,
	secret: process.env.WEB_SESS_SECRET,
	name: process.env.WEB_SESS_NAME,
	resave: false,
	saveUninitialized: false
}));

/**
 * Request logger middleware
 */
app.use(requestLogger)

/**
 * Setup passport middleware
 */
initPassport(app);

/**
 * express middleware to handle unhandled errors
 */
app.use((err: Error, req: Request, res: Response, next: any) => {
	res.locals.message = err.message;
	res.locals.error = process.env.NODE_ENV === 'development' ? err : {};
	logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
	res.status(500).send(err);
});

app.use('/api/auth', authRouter);
app.use('/api/branches', branchRouter);
app.use('/api/people', peopleRouter);
app.use('/api/repositories', repositoryRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api', apiRouter);

/**
 * initialize Swagger. Must be initialized last to account for all routes
 */
swaggerDocs(app);

/**
 * Start the listener
 */
app.listen(port, () => {
	let dockerPort = port;
	let baseUrl = `http://localhost:${process.env.WEB_LOCAL_PORT}`;
	logger.log(LogLevels.INFO, `code-review api listening on:\n port: ${dockerPort}\n Locally at: ${baseUrl}\ncode-review Ready to rock!`);
});
