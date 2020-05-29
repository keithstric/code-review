import {logger} from '../config/logger/logger';
import * as queryString from 'querystring';
import * as url from 'url';
import authReqMiddleware from '../config/restrict-path';
import {getVertexByPropertyName, getVerticesByType} from '../helpers/db-utils';
import {getDbConn} from '../config/arango.config';
import express, {Request, Response} from 'express';
import {Database, aql} from 'arangojs';
import {getPaginationParams} from '../helpers/url-utils';
import {DocCollections} from '../project-types';

const db: Database = getDbConn();

export const peopleRouter = express.Router();

/**
 * @swagger
 * /api/people:
 *   get:
 *     description: Get all people
 *     tags:
 *       - people
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PersonArray'
 *       401:
 *         $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 *     parameters:
 *       - $ref: '#/components/parameters/startPosParam'
 *       - $ref: '#/components/parameters/limitParam'
 */
peopleRouter.get('/', authReqMiddleware, async (req: Request, res: Response) => {
	try {
		const paginationParams = getPaginationParams(req.originalUrl);
		const people = await getVerticesByType(DocCollections.PEOPLE, paginationParams.startPos, paginationParams.limit);
		res.send(people);
	}catch (err) {
		logger.error(`Error getting people: ${err.message}`);
		res.status(500).send(err);
	}
});

/**
 * @swagger
 * /api/people/{key}:
 *   get:
 *     description: Get a person with the provided id which is the _key value in arango
 *     tags:
 *       - people
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Person'
 *       401:
 *         $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 *     parameters:
 *       - name: id
 *         description: the id of the person
 *         in: path
 *         schema:
 *           type: string
 */
peopleRouter.get('/:key', authReqMiddleware, async (req: Request, res: Response) => {
	try {
		const person = await getVertexByPropertyName('_key', req.params.id, DocCollections.PEOPLE);
		res.send(person);
	}catch (err) {
		logger.error(`Error getting person with id ${req.params.id}: ${err.message}`);
		res.status(500).send(err);
	}
})
