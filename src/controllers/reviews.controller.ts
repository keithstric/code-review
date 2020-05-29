import {Request, Response} from 'express';
import {Commit, Diff, Reference, Repository} from 'nodegit';
import {logger} from '../config/logger/logger';
import {
	createEdge,
	createVertex,
	getConnectedVertices,
	getVertexByPropertyName,
	getVerticesByType,
	updateVertex
} from '../helpers/db-utils';
import {
	cloneNgRepository, getBranchCommits,
	getBranchNameFromNgRef,
	getLocalNgRepository,
	getNgRepoBranches,
	getRepoBranchVertices
} from '../helpers/git-utils';
import {getPaginationParams} from '../helpers/url-utils';
import {RawCRBranch} from '../models/branch';
import {RawEdge} from '../models/edge';
import {RawPerson} from '../models/person';
import {RawCRRepository} from '../models/repository';
import {RawReview, Review} from '../models/review';
import {RawVertex} from '../models/vertex';
import {DocCollections, EdgeCollections, EdgeTraversalDirections, NamedGraphs} from '../typings/project-types';
import {VertexController} from './vertex.controller';
import * as gitKit from 'nodegit-kit';

export class ReviewsController extends VertexController {

	constructor() {
		super();
	}

	/**
	 * Get an array of reviews and include all their connected vertices
	 * @param req {Request}
	 * @param res {Response}
	 */
	async getCombinedReviews(req: Request, res: Response) {
		const parsedParams = getPaginationParams(req.originalUrl);
		try {
			const reviews = await getVerticesByType(DocCollections.REVIEWS, parsedParams.startPos, parsedParams.limit);
			const results = await Promise.all(reviews.results.map((rawReview: RawReview[]) => {
				return new Review(rawReview).init();
			}));
			return {...reviews, results: results};
		}catch(err) {
			throw err;
		}
	}

	/**
	 * Get a specific review and include all of it's connected vertices
	 * @param req {Request}
	 * @param res {Response}
	 */
	async getCombinedReview(req: Request, res: Response) {
		try {
			const rawReview = await getVertexByPropertyName('_key', req.params.key, DocCollections.REVIEWS);
			return await new Review(rawReview).init();
		}catch(err) {
			throw err;
		}
	}

	/**
	 * Create a review and all it's various edges
	 * @param req {Request}
	 * @param res {Response}
	 * @todo this should become a transaction once the damn thing is working
	 */
	async createReview(req: Request, res: Response) {
		try {
			const rawUser: RawPerson = req.user as RawPerson;
			const reviewer = await getVertexByPropertyName('_id', req.body.reviewer, DocCollections.PEOPLE);
			if (!reviewer && rawUser) {
				throw new Error(`Can not find reviewer with id ${reviewer._id}. Operation terminated.`);
			}else{
				const rawReview = req.body;
				const branch = await this.getReviewBranch(rawReview, rawUser);
				if (!branch) {
					throw new Error(`Could not find branch identified by ${rawReview.branchName || rawReview.branchId}`);
				}else {
					const review = await createVertex(req.body, 'reviews');
					await createEdge(EdgeCollections.REQUESTED, rawUser._id, review._id);
					await createEdge(EdgeCollections.INVITED, review._id, reviewer._id);
					await createEdge(EdgeCollections.EVALUATES, review._id, branch._id);
					res.send(review);
				}
			}
		}catch (err) {
			// todo: rollback everything created
			const msg = `Error occurred creating a review: ${err.message}`;
			logger.error(`${msg}, ${err.stack}`);
			res.status(500).send({message: msg});
		}
	}

	/**
	 * Get the branch for the provided review
	 * @param review {RawReview}
	 * @param rawUser {RawPerson}
	 * @returns {RawCRBranch}
	 */
	private async getReviewBranch(review: RawReview, rawUser: RawPerson) {
		let branch: RawCRBranch = null;
		if (review && rawUser) {
			try {
				if (!review.repositoryId && review.repositoryUrl) {
					const result = await this.cloneRepository(review, rawUser);
					if (result && result.branches && result.branches.length) {
						branch = result.branches.find(branch => branch.name.toLowerCase() === review.branchName.toLowerCase());
					}
				} else if (review.repositoryId) {
					if (review.branchId) {
						branch = await getVertexByPropertyName('_key', review.branchId, DocCollections.BRANCHES);
					} else if (review.branchName) {
						const repoVert = await getVertexByPropertyName('_id', review.repositoryId, DocCollections.REPOSITORIES);
						const repo: Repository = await getLocalNgRepository(repoVert.path);
						const branches: RawCRBranch[] = await getRepoBranchVertices(repo);
						branch = branches.find(branchVert => branch.name === review.branchName);
						if (!branch) {
							await (repo as any).refreshReferences();
							const result = await this.createRepositoryEdges(repoVert, repo, branches);
							branch = result.branches.find(brVert => brVert.name === review.branchName);
						}
					}
				}
			}catch(err) {
				throw err;
			}
		}else{
			throw new Error(`You must provide both a review and user`);
		}
		return branch;
	}

	/**
	 * If we don't already have a repository, make a new clone of the repository
	 * @param newReview
	 * @param rawUser
	 */
	private async cloneRepository(newReview: RawReview, rawUser: RawPerson) {
		if (newReview && rawUser) {
			try {
				const repo = await cloneNgRepository(newReview.repositoryUrl, newReview.repositoryName);
				if (repo) {
					const repoVertex = await createVertex({
						name: newReview.repositoryName,
						url: newReview.repositoryUrl,
						path: repo.path().substring(0, repo.path().lastIndexOf('/.git'))
					}, DocCollections.REPOSITORIES);
					const result = await this.createRepositoryEdges(repoVertex, repo);
					const addedEdge = await createEdge(EdgeCollections.ADDED, rawUser._id, repoVertex._id);
					return {
						repo: repoVertex,
						addedEdge: addedEdge,
						containsEdges: result.containsEdges,
						branches: result.branches
					};
				}
			}catch (err) {
				throw err;
			}
		}else{
			throw new Error(`You must provide both a review and user`);
		}
	}

	/**
	 * Create the required edges between a repository and branch(es)
	 * @param repoVertex {RawCRRepository}
	 * @param repo {Repository}
	 * @param knownRepoBranches {RawCRBranch[]}
	 * @returns {{containsEdges: RawEdge, branches: RawCRBranch[]}}
	 */
	private async createRepositoryEdges(repoVertex: RawCRRepository, repo: Repository, knownRepoBranches?: RawCRBranch[]) {
		if (repoVertex && repo) {
			try {
				const branchRefs: Reference[] = await getNgRepoBranches(repo);
				const containsEdges: RawEdge[] = [];
				const branches: RawCRBranch[] = knownRepoBranches || [];
				for (let i = 0; i < branchRefs.length; i++) {
					const branchRef: Reference = branchRefs[i];
					const rawBranchPayload = {name: branchRef.shorthand()};
					let branchVert = branches.find(rawBr => rawBr.name === rawBranchPayload.name);
					const knownBranch = !!branchVert;
					if (!knownBranch) {
						branchVert = await createVertex(rawBranchPayload, DocCollections.BRANCHES);
						const containsEdge: RawEdge = await createEdge(EdgeCollections.CONTAINS, repoVertex._id, branchVert._id);
						containsEdges.push(containsEdge);
					}
					branches.push(branchVert);
				}
				return {containsEdges: containsEdges, branches: branches};
			}catch (err) {
				throw err;
			}
		}else{
			throw new Error(`You must provide a repository vertex and repository`);
		}
	}

	/**
	 * Update a document
	 * @param req {Request}
	 * @param res {Response}
	 */
	async updateReview(req: Request, res: Response) {
		const key = req.params.key;
		if (key && req.body) {
			try {
				return await updateVertex(key, DocCollections.REVIEWS, req.body);
			}catch (err) {
				const message = `Error occurred updating a review with key ${key}. Missing parameters: ${err.message}`;
				logger.error(message);
				res.status(500).send({message: message});
				throw err;
			}
		}
	}

	async getCommits(req: Request, res: Response) {
		const reviewKey = req.params.key;
		try {
			const rawReview = await getVertexByPropertyName('_key', reviewKey, DocCollections.REVIEWS);
			const review = await new Review(rawReview).init();
			const repoVert = review.repository;
			const repo = await getLocalNgRepository(repoVert.path);
			const commitsCallback = async (rawCommits: Commit[]) => {
				const commitObjs: any[] = [];
				const diffStatuses: string[] = [];
				for (let i = 0; i < rawCommits.length; i++) {
					const rawCommit = rawCommits[i];
					const diffs: any[] = await gitKit.diff(repo, rawCommit);
					diffs.forEach((diff) => {
						diffStatuses.push(diff.status)
					});
					commitObjs.push({
						id: rawCommit.sha(),
						message: rawCommit.message(),
						date: rawCommit.date(),
						author: rawCommit.committer().name(),
						diff: diffs
					});
				}
				// console.log('diff uniq statuses', Array.from(new Set(diffStatuses)));
				res.send(commitObjs);
			};
			await getBranchCommits(repo, review.branch.name, commitsCallback.bind(this));
		}catch(err) {
			logger.error(`Error occurred getting commits for review ${reviewKey}: ${err.message}`);
			throw err;
		}
	}

}
