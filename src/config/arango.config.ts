import {Database} from 'arangojs';

export const getDbConn = () => {
	const dbPort = parseInt(process.env.DB_PORT);
	const baseDb = new Database({
		url: `http://${process.env.DB_HOST}:${dbPort}`,
	});
	const db = baseDb.useDatabase(process.env.DB_NAME);
	db.useBasicAuth(process.env.DB_USER, process.env.DB_PASSWORD);
	return db;
}
