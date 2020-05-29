import {Branch, Clone, Commit, Reference, Repository} from 'nodegit';
import path from 'path';
import {logger} from '../config/logger/logger';
import {RawCRRepository} from '../models/repository';
import {DocCollections, EdgeTraversalDirections, NamedGraphs} from '../typings/project-types';
import {getConnectedVertices, getVertexByPropertyName} from './db-utils';

/**
 * Clone a repository
 * @param url {string}
 * @param name {string}
 * @returns {Repository}
 */
export const cloneNgRepository = async (url: string, name: string) => {
	if (url) {
		const repoPath = path.join('/', 'tmp', 'code-review', name);
		const repo = await Clone.clone(url, repoPath);
		logger.info(`Clone repository ${name} with url ${url}`);
		return repo;
	}else{
		throw new Error('You must provide a URL to the repository in order to clone a repository');
	}
}

/**
 * Get the branch references from a repository
 * @param repo {Repository}
 * @returns {Reference[]}
 */
export const getNgRepoBranches = async (repo: Repository) => {
	if (repo) {
		const repoBranches: Reference[] = [];
		try {
			const refs = await repo.getReferences();
			if (refs && refs.length) {
				const branchRefs = refs.filter(ref => ref.isBranch());
				if (branchRefs && branchRefs.length) {
					for (let i = 0; i < branchRefs.length; i++) {
						repoBranches.push(branchRefs[i]);
					}
				}
			}
			return repoBranches;
		}catch (err) {
			throw err;
		}
	}else{
		throw new Error('You must provide a repository')
	}
}

/**
 * Get the branch name from a Reference name
 * @param ref {Reference}
 * @returns {string}
 */
export const getBranchNameFromNgRef = (ref: Reference) => {
	if (ref) {
		const fullName = ref.name();
		const fullNameArr = fullName.split('/');
		return fullNameArr.pop();
	}
	return null;
}

/**
 * Get an already cloned Repository
 * @param path {string}
 * @returns {Repository}
 */
export const getLocalNgRepository = async (path: string) => {
	if (path) {
		return await Repository.open(path);
	}else{
		throw new Error('You must provide a path to the repository');
	}
}

/**
 * Get the branch vertices for a repository
 * @param repo? {Repository}
 * @param repositoryPath? {string}
 * @param repositoryId? {string}
 */
export const getRepoBranchVertices = async (repo?: Repository, repositoryPath?: string, repositoryId?: string) => {
	if (repo || repositoryPath || repositoryId) {
		let repoPath = repositoryPath;
		if (repo && !repositoryPath) {
			repoPath = repo.path();
		}
		try {
			if (repoPath && !repositoryId) {
				const repoVert: RawCRRepository = await getVertexByPropertyName('path', repoPath, DocCollections.REPOSITORIES);
				repositoryId = repoVert._id;
			}
			return await getConnectedVertices(repositoryId, DocCollections.REPOSITORIES, 1, 1, EdgeTraversalDirections.OUT, NamedGraphs.REPOSITORY);
		} catch (err) {
			throw err;
		}
	}else{
		throw new Error(`You must provide at least 1 argument in order to locate the repository`);
	}
}


export const getBranchCommits = async (repo: Repository, branchName: string, callback: Function) => {
	if (repo && branchName) {
		try {
			const firstCommit = await repo.getBranchCommit(branchName);
			const history = firstCommit.history();
			history.on('end', (commits: Commit[]) => {
				callback(commits);
			});
			history.start();
		}catch (err) {
			throw err;
		}
	}else{
		throw new Error(`You must provide both a repository and branch name`);
	}
}
