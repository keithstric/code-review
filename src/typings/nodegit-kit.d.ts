declare module "nodegit-kit" {
	import {Commit, Oid, Repository} from 'nodegit';

	export function open(path: string, options?: {init: boolean}): Promise<Repository>;
	export function commit(repo: Repository, options?: {message: string}): Promise<Oid>;
	export function status(repo: Repository): Promise<any[]>;
	export function log(repo: Repository, options?: {branch?: string, sort?: 'none'|'topological'|'time'|'reverse', 'abbrev-commit'?: boolean, abbrev?: number, 'max-count'?: number}): Promise<Commit[]>;
	export function diff(repo: Repository, commit?: Commit, commit1?: Commit, options?: {'name-only': boolean}): Promise<any[]>;
	export function init(path: string, options?: {bare: number, commit: boolean, message: string}): Promise<Repository>;
}
