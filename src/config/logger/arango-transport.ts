import {aql, Database} from 'arangojs';
import winston, {LogEntry} from 'winston';
import {createVertex} from '../../helpers/db-utils';
import {DocCollections, IArangoDbLogQueryOptions, LogLevels} from '../../project-types';
import {getDbConn} from '../arango.config';
import Transport from 'winston-transport';

export interface ArangoDbTransportConfig {
	logCollection?: string;
	errorLogCollection?: string;
	requestLogCollection?: string;
	level?: LogLevels,
	format?: any,
	handleExceptions?: boolean,
	db: Database
}

export class ArangoTransport extends Transport {
	options: ArangoDbTransportConfig;
	db: Database;

	constructor(options: ArangoDbTransportConfig) {
		super(options);
		this.db = getDbConn();
		this.options = {
			logCollection: DocCollections.SYSTEMLOGS,
			errorLogCollection: DocCollections.ERRORLOGS,
			requestLogCollection: DocCollections.REQUESTLOGS,
			...options
		}
	}

	get name(): string {
		return 'ArangoTransport'
	}

	/**
	 * Logs an entry in the log
	 * @param {any} logEntry
	 * @param {NextFunction} next
	 */
	async log(logEntry: LogEntry, next:() => void) {
		setImmediate(() => {
			this.emit('logged', logEntry);
		});
		if (this.db) {
			try {
				if (logEntry.level !== LogLevels.HTTP && this.level === LogLevels.HTTP) {
					// do nothing, prevents double entries
				}else {
					let collection = this.getCollection(logEntry);
					const coll = await this.db.collection(collection);
					const query = aql`insert ${logEntry} in ${coll} return NEW`;
					await this.db.query(query);
				}
			}catch (err) {
				console.error(`Error logging to ArangoDb: ${err.message}`);
			}
		}
		next();
	}

	/**
	 * For query OrientDb for logs
	 * @param {IArangoDbLogQueryOptions} options
	 * @param {function} callback
	 * @todo implement this so we can query the logs
	 */
	query(options: IArangoDbLogQueryOptions, callback: any) {	}


	getCollection(logEntry: LogEntry) {
		if (logEntry.level === LogLevels.HTTP) {
			return this.options.requestLogCollection;
		}else if (logEntry.level === LogLevels.ERROR) {
			return this.options.errorLogCollection;
		}
		return this.options.logCollection;
	}
}
