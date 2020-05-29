import express, {Request, Response} from 'express';
import {logger} from '../config/logger/logger';
import authReqMiddleware from '../config/restrict-path';
import {RepositoryController} from '../controllers/repository.controller';
import {getConnectedVertices, getVerticesByType} from '../helpers/db-utils';
import {getPaginationParams} from '../helpers/url-utils';
import {DocCollections, EdgeTraversalDirections, NamedGraphs} from '../typings/project-types';

export const repositoryRouter = express.Router();
const controller = new RepositoryController();

/**
 * @swagger
 * /api/repositories:
 *   get:
 *     description: Get all repositories
 *     tags:
 *       - repositories
 *     responses:
 *       200:
 *         $ref: '#/components/responses/RepositoryArray'
 *       401:
 *         $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 *     parameters:
 *       - $ref: '#/components/parameters/startPosParam'
 *       - $ref: '#/components/parameters/limitParam'
 */
repositoryRouter.get('/', authReqMiddleware, async (req: Request, res: Response) => {
	try {
		const parsedParams = getPaginationParams(req.originalUrl);
		const repositories = await getVerticesByType(DocCollections.REPOSITORIES, parsedParams.startPos, parsedParams.limit);
		res.send(repositories);
	}catch (err) {
		const msg = `Error fetching the repositories`;
		logger.error(msg);
		res.status(500).send({message: msg});
	}
});

/**
 * @swagger
 * /api/repositories/{key}:
 *   delete:
 *     description: Delete a repository and it's edges
 *     tags:
 *       - repositories
 *     responses:
 *       200:
 *         $ref: '#/components/responses/RepositoryArray'
 *       401:
 *         $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 *     parameters:
 *       - $ref: '#/components/parameters/keyParam'
 */
repositoryRouter.delete('/:key', async (req: Request, res: Response) => {
	try {
		const returnVal = await controller.deleteRepository(req.params.key);
		res.send(returnVal);
	}catch(err) {
		const msg = `Error deleting repository with key ${req.params.key}: ${err.message}`;
		logger.error(msg);
		res.status(500).send({message: msg});
	}
});

/**
 * @swagger
 * /api/repositories/{key}/branches:
 *   get:
 *     description: Get all the branches for a repository
 *     tags:
 *       - repositories
 *     responses:
 *       200:
 *         $ref: '#/components/responses/BranchArray'
 *       401:
 *         $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 *     parameters:
 *       - $ref: '#/components/parameters/keyParam'
 *
 */
repositoryRouter.get('/:key/branches', async(req: Request, res: Response) => {
	try {
		const branches = await getConnectedVertices(req.params.key, DocCollections.REPOSITORIES, 1, 1, EdgeTraversalDirections.OUT, NamedGraphs.REPOSITORY);
		res.send(branches);
	}catch(err) {
		const msg = `Error deleting repository with key ${req.params.key}: ${err.message}`;
		logger.error(msg);
		res.status(500).send({message: msg});
	}
})
