import express, {Request, Response} from 'express';
import authReqMiddleware from '../config/restrict-path';
import {ReviewsController} from '../controllers/reviews.controller';
import {deleteVertex} from '../helpers/db-utils';
import {DocCollections, NamedGraphs} from '../project-types';

export const reviewRouter = express.Router();

const controller: ReviewsController = new ReviewsController();

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     description: Get all reviews
 *     tags:
 *       - reviews
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ReviewArray'
 *       401:
 *         $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 *     parameters:
 *       - $ref: '#/components/parameters/startPosParam'
 *       - $ref: '#/components/parameters/limitParam'
 */
reviewRouter.get('/', authReqMiddleware, async (req: Request, res: Response) => {
	try {
		const reviews = await controller.getCombinedReviews(req, res);
		res.send(reviews);
	}catch (err) {
		res.status(500).send(err);
	}
});

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     description: Create a new review
 *     tags:
 *       - reviews
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Review'
 *       401:
 *         $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 *     requestBody:
 *       description: Payload for creating a review document
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *
 */
reviewRouter.post('/', authReqMiddleware, async (req: Request, res: Response) => {
	try {
		await controller.createReview(req, res);
	}catch (err) {
		res.status(500).send(err);
	}
});

/**
 * @swagger
 * /api/reviews/{key}:
 *   get:
 *     description: Get a review by it's _key
 *     tags:
 *       - reviews
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Review'
 *       401:
 *         $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 *     parameters:
 *       - $ref: '#/components/parameters/keyParam'
 */
reviewRouter.get('/:key', authReqMiddleware, async (req: Request, res: Response) => {
	try {
		const review = await controller.getCombinedReview(req, res);
		res.send(review);
	}catch (err) {
		const msg = `An error occurred fetching a review with id ${req.params.key}: ${err.message}`;
		console.error(msg)
		res.status(500).send({message: msg});
	}
});

/**
 * @swagger
 * /api/reviews/{key}:
 *   patch:
 *     description: Update a review by it's _key
 *     tags:
 *       - reviews
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Review'
 *       401:
 *         $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 *     parameters:
 *       - $ref: '#/components/parameters/keyParam'
 *     requestBody:
 *       description: Full or Partial review object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#components/schemas/Review'
 */
reviewRouter.patch('/:key', authReqMiddleware, async (req: Request, res: Response) => {
	try {
		const updatedDoc = await controller.updateReview(req, res);
		res.send(updatedDoc.new);
	}catch(err) {
		res.status(500).send(err);
	}
});

/**
 * @swagger
 * /api/reviews/{key}:
 *   delete:
 *     description: Delete a review and all it's edges
 *     tags:
 *       - reviews
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Review'
 *       401:
 *         $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 *     parameters:
 *       - $ref: '#/components/parameters/keyParam'
 */
reviewRouter.delete('/:key', authReqMiddleware, async (req: Request, res: Response) => {
	try {
		const delVert = await deleteVertex(req.params.key, DocCollections.REVIEWS, NamedGraphs.REVIEW);
		res.send(delVert);
	}catch(err) {
		res.status(500).send(err);
	}
});

/**
 * @swagger
 * /api/reviews/{key}/commits:
 *   get:
 *     description: Get the commits for the review. The key is the review's _key
 *     tags:
 *       - reviews
 *     responses:
 *       401:
 *         $ref: '#/components/responses/Message'
 *       500:
 *         $ref: '#/components/responses/Error'
 *     parameters:
 *       - $ref: '#/components/parameters/keyParam'
 */
reviewRouter.get('/:key/commits', authReqMiddleware, async (req: Request, res: Response) => {
	try {
		await controller.getCommits(req, res);
	}	catch(err) {
		res.status(500).send(err);
	}
});
