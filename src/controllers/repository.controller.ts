import path from "path";
import rimraf from 'rimraf';
import {deleteVertex, getConnectedVertices, getVertexByPropertyName} from '../helpers/db-utils';
import {getLocalNgRepository} from '../helpers/git-utils';
import {RawCRRepository} from '../models/repository';
import {DocCollections, EdgeTraversalDirections, NamedGraphs} from '../typings/project-types';
import {VertexController} from './vertex.controller';

export class RepositoryController extends VertexController {

	constructor() {
		super();
	}

	async deleteRepository(key: string) {
		try {
			const deletedBranches = [];
			const crRepo = await getVertexByPropertyName('_key', key, DocCollections.REPOSITORIES);
			this.deleteRepositoryDirectory(crRepo);
			const relatedBranches = await getConnectedVertices(key, DocCollections.REPOSITORIES, 1, 1, EdgeTraversalDirections.OUT, NamedGraphs.REPOSITORY);
			if (relatedBranches && relatedBranches.length) {
				for (let i = 0; i < relatedBranches.length; i++) {
					const relatedBranch = relatedBranches[i];
					const deletedBranch = await deleteVertex(relatedBranch._key, DocCollections.BRANCHES, NamedGraphs.REPOSITORY);
					deletedBranches.push(deletedBranch);
				}
			}
			const deletedRepo = await deleteVertex(key, DocCollections.REPOSITORIES, NamedGraphs.REPOSITORY);
			return {deletedRepository: deletedRepo, deletedBranches: deletedBranches};
		}catch(err) {
			throw err;
		}
	}

	deleteRepositoryDirectory(delVertex: RawCRRepository) {
		const repositoryPath = delVertex.path;
		rimraf(repositoryPath, (err) => {
			if (err) {
				throw new Error(`Error deleting repository ${delVertex.name} at ${repositoryPath}: ${err.message}`);
			}
		});
	}
}
