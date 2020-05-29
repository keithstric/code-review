/**
 * Various Interfaces used throughout this project. Add additional Interfaces here
 */
import {QueryOptions} from "winston";

/**
 * Interface for the object used to build a database query. This is currently built from
 * a Request.query object.
 * queryOperator is required to be included as one of the parameters
 */
export interface IDbQuery extends QueryOptions {
	queryOperator: string;
	[x: string]: any;
}
/**
 * enum of the winston Log Levels
 */
export enum LogLevels {
	ERROR = 'error',
	WARN = 'warn',
	INFO = 'info',
	HTTP = 'http',
	VERBOSE = 'verbose',
	DEBUG = 'debug',
	SILLY = 'silly'
}
/**
 * Interface for a log entry
 */
export interface ILogEntry {
	message: string;
	level: LogLevels;
	service?: string;
	timestamp?: string;
}

export interface IRequestLogEntry extends ILogEntry {
	httpVersion: string;
	method: string;
	processing_time_ms: number;
	remote_family: string;
	request_body: string;
	request_headers: string;
	request_ip: string;
	request_route: string;
	request_url: string;
	response_status: number;
	response_headers: string;
}

export interface IArangoDbLogQueryOptions extends QueryOptions {
	logType?: 'Log' | 'RequestLog'
}

export enum EdgeCollections {
	ADDED = 'added',
	CONTAINS = 'contains',
	EVALUATES = 'evaluates',
	INVITED = 'invited',
	REQUESTED = 'requested',
	REVIEWEDBY = 'reviewedBy',
}

export enum DocCollections {
	BRANCHES = 'branches',
	ERRORLOGS = 'errorLogs',
	PEOPLE = 'people',
	REPOSITORIES = 'repositories',
	REQUESTLOGS = 'requestLogs',
	REVIEWS = 'reviews',
	SESSIONS = 'sessions',
	SYSTEMLOGS = 'systemLogs'
}

export enum EdgeTraversalDirections {
	IN = 'inbound',
	OUT = 'outbound',
	ANY = 'any'
}

export enum NamedGraphs {
	REPOSITORY = 'repositoryGraph',
	REVIEW = 'reviewGraph'
}
