import {getConnectedVertices} from '../helpers/db-utils';
import {DocCollections, EdgeTraversalDirections, NamedGraphs} from '../typings/project-types';
import {CRBranch, RawCRBranch} from './branch';
import {Person, RawPerson} from './person';
import {RawCRRepository} from './repository';
import {RawVertex, Vertex} from './vertex';

export interface RawReview extends RawVertex {
	repositoryUrl?: string;
	repositoryName?: string;
	repositoryId?: string;
	branchId?: string;
	branchName?: string;
	requestor?: string;
	reviewer?: string;
	notes?: string;
}

export class Review extends Vertex implements RawReview {
	repositoryId?: string;
	repositoryUrl: string;
	repositoryName: string;
	branchId?: string;
	branchName: string;
	requestor?: string;
	reviewer?: string;
	notes?: string;
	private _branch?: RawCRBranch;
	private _requestorVert?: RawPerson;
	private _invitee?: RawPerson;
	private _repository?: RawCRRepository;

	constructor(rawReview: RawReview) {
		super(rawReview);
		Object.assign(this, rawReview);
		this.init();
	}

	init() {
		return Promise.all([
			this.getBranch(),
			this.getRequestor(),
			this.getInvitee(),
			this.getRepository()
		]).then(() => {
			return this;
		});
	}

	get branch() {
		return this._branch;
	}

	get requestorVert() {
		return this._requestorVert;
	}

	get invitee() {
		return this._invitee;
	}

	get repository() {
		return this._repository;
	}

	async getBranch() {
		if (!this._branch) {
			const verts = await getConnectedVertices(this._key, DocCollections.REVIEWS, 1, 1, EdgeTraversalDirections.OUT, NamedGraphs.REVIEW);
			this._branch = verts.find((vert: RawCRBranch) => {
				return vert._id.indexOf(DocCollections.BRANCHES) > -1;
			});
		}
		return this._branch;
	}

	async getRequestor() {
		if (!this._requestorVert) {
			const verts = await getConnectedVertices(this._key, DocCollections.REVIEWS, 1, 1, EdgeTraversalDirections.IN, NamedGraphs.REVIEW);
			this._requestorVert = verts.find((vert: RawPerson) => {
				return vert._id.indexOf(DocCollections.PEOPLE) > -1;
			});
		}
		return this._requestorVert;
	}

	async getInvitee() {
		if (!this._invitee) {
			const verts = await getConnectedVertices(this._key, DocCollections.REVIEWS, 1, 1, EdgeTraversalDirections.OUT, NamedGraphs.REVIEW);
			this._invitee = verts.find((vert: RawPerson) => {
				return vert._id.indexOf(DocCollections.PEOPLE) > -1;
			});
		}
		return this._invitee;
	}

	async getRepository() {
		if (!this._repository) {
			const verts = await getConnectedVertices(this._key, DocCollections.REVIEWS, 1, 2, EdgeTraversalDirections.ANY, NamedGraphs.REVIEW);
			this._repository = verts.find((vert: RawPerson) => {
				return vert._id.indexOf(DocCollections.REPOSITORIES) > -1;
			});
		}
		return this._repository;
	}

}
