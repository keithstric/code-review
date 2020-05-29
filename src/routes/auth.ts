import {logger} from '../config/logger/logger';
import {AuthController} from '../controllers/auth.controller';
import express, {NextFunction, Request, Response} from 'express';

export const authRouter = express.Router();

const controller = new AuthController();
/**
 * @swagger
 * /api/auth:
 *   get:
 *     tags:
 *       - authentication
 *     description: Auth base route
 *     responses:
 *       401:
 *         $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
authRouter.get('/', async (req: Request, res: Response) => {
	try {
		const user = await controller.findPersonByEmail('keithstric@gmail.com');
		res.send(user);
	}catch(err) {
		logger.error(`Error occurred in authRouter.get("/")`);
		res.status(500).send(err);
	}
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - authentication
 *     description: Authentication via passport.authenticate, calls passport middleware. Callback executed if authentication is successful
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Person'
 *       401:
 *         $ref: '#/components/responses/Message'
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 description: User's email address
 *                 type: string
 *               password:
 *                 description: User's password
 *                 type: string
 */
authRouter.post('/login', (req: Request, res: Response, next: NextFunction) => {
	controller.login(req, res, next);
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - authentication
 *     description: register a user
 *     responses:
 *       200:
 *         description: JSON object containing a message or Person
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/Person'
 *                 - $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password, verify_password]
 *             properties:
 *               first_name:
 *                 description: First Name
 *                 type: string
 *               last_name:
 *                 description: Last Name
 *                 type: string
 *               email:
 *                 description: User's email address
 *                 type: string
 *               password:
 *                 description: User's password
 *                 type: string
 *               verify_password:
 *                 description: Verify User's password
 *                 type: string
 */
authRouter.post('/register', (req: Request, res: Response) => {
	controller.register(req, res);
});

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     tags:
 *       - authentication
 *     description: Logout the user, destroy the session, clear the cookie
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
authRouter.get('/logout', (req: Request, res: Response) => {
	controller.logout(req, res);
});
