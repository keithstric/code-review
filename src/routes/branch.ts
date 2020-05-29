import express, {Request, Response} from 'express';

export const branchRouter = express.Router();

/**
 * @swagger
 * /api/branch:
 *   get:
 *     description: Get all branches
 *     responses:
 *       401:
 *         $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
branchRouter.get('/', (req: Request, res: Response) => {
	res.send('Branch, /api/branch');
});
