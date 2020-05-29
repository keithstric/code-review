/**
 * This file sets up the winston logger
 * https://www.npmjs.com/package/winston
 */
import {createLogger, format, transports} from 'winston';
import {LogLevels} from "../../project-types";
import {getDbConn} from '../arango.config';
import {ArangoTransport} from './arango-transport';

const db = getDbConn();

export const logger = createLogger({
	defaultMeta: {service: 'code-review', timestamp: new Date().toISOString()},
	format: format.errors({stack: true}),
	transports: [
		new transports.Console({
			level: LogLevels.ERROR,
			format: format.combine(
				format.colorize(),
				format.splat(),
				format.prettyPrint()
			)
		}),
		new ArangoTransport({
			db: db,
			level: LogLevels.INFO,
			format: format.combine(
				format.timestamp({
					format: 'YYYY-MM-DD\'T\'HH:mm:ss.SSS\'Z\''
				}),
				format.splat(),
				format.json()
			),
			handleExceptions: true
		}),
		new ArangoTransport({
			db: db,
			level: LogLevels.HTTP,
			format: format.combine(
				format.timestamp({
					format: 'YYYY-MM-DD\'T\'HH:mm:ss.SSS\'Z\''
				}),
				format.splat(),
				format.json()
			),
			handleExceptions: true
		})
	]
});

// For development only. Pipe all logging events (with exception of http) to the console
// this may and will produce double error messages going to the console
// one for this transport and one for the console transport defined in the initial creation
if (process.env.NODE_ENV !== 'production') {
	logger.add(new transports.Console({
		format: format.combine(
			format.colorize(),
			format.splat(),
			format.simple()
		)
	}));
}
