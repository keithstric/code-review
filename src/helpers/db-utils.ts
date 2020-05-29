import {aql, Database} from 'arangojs';
import {getDbConn} from '../config/arango.config';
import {logger} from '../config/logger/logger';
import {DocCollections, EdgeCollections, EdgeTraversalDirections, NamedGraphs} from '../typings/project-types';

const db: Database = getDbConn();

/**
 * Create a vertex in the db
 * @param payload {any}
 * @param collection {string}
 * @returns {Promise<any>}
 */
export const createVertex = async (payload: any, collection: string) => {
	if (payload && collection) {
		try {
			payload.created_date = new Date().toISOString();
			const coll = db.collection(collection);
			const query = aql`insert ${payload} in ${coll} return NEW`;
			const cursor = await db.query(query);
			const vertex = await cursor.next();
			logger.info(`Created vertex in collection ${collection} with id ${vertex._id} and key ${vertex._key}`);
			return vertex;
		}catch (err) {
			throw err;
		}
	}else{
		return null;
	}
}

/**
 * Get a vertex by a value in a property from orient db
 * @param propertyName {string}
 * @param propertyValue {string|number}
 * @param collection {string}
 * @returns {Promise<any>}
 */
export const getVertexByPropertyName = async (propertyName: string, propertyValue: string|number, collection: string) => {
	if (propertyName && propertyValue && collection) {
		try {
			const coll = db.collection(collection);
			const query = aql`for v in ${coll} filter v.${propertyName} == ${propertyValue} return v`;
			const cursor = await db.query(query);
			return await cursor.next();
		}catch(err) {
			throw err;
		}
	}else{
		return null;
	}
}

/**
 * Create an edge
 * @param label {string}
 * @param fromVertId {string} the _id of a vertex NOT _key
 * @param toVertId {string} the _id of a vertex NOT _key
 * @param payload {any}
 */
export const createEdge = async (label: EdgeCollections, fromVertId: string, toVertId: string, payload?: any) => {
	if (label && fromVertId && toVertId) {
		try {
			const coll = await db.edgeCollection(label);
			payload = {
				_from: fromVertId,
				_to: toVertId,
				...payload
			};
			const query = aql`insert ${payload} into ${coll} return NEW`;
			const cursor = await db.query(query);
			const edge = await cursor.next();
			logger.info(`Created a ${label} edge from ${fromVertId} to ${toVertId}`);
			return edge;
		}catch (err) {
			throw err;
		}
	}else{
		return null;
	}
}

/**
 * Delete a vertex
 * @param key {string}
 * @param collection {DocCollections}
 * @param graphName {NamedGraphs}
 */
export const deleteVertex = async (key: string, collection: DocCollections, graphName?: NamedGraphs) => {
	if (key && collection) {
		try {
			const coll = db.collection(collection);
			const relatedEdges = await getConnectedEdges(key, collection, 1, 1, EdgeTraversalDirections.ANY, graphName);
			const deletedEdges = [];
			if (relatedEdges && relatedEdges.length) {
				for (let i = 0; i < relatedEdges.length; i++) {
					const edge = relatedEdges[i];
					const edgeColl = getCollectionNameFromId(edge._id) as EdgeCollections;
					const deletedEdge = await deleteEdge(edge._key, edgeColl);
					deletedEdges.push(deletedEdge);
				}
			}
			const query = aql`for v in ${coll} filter v._key == ${key} remove {_key: v._key} in ${coll} return OLD`;
			const cursor = await db.query(query);
			const vertex = await cursor.next();
			logger.info(`deleted vertex with key ${key} in collection ${collection} and ${deletedEdges.length} edges`);
			return {deletedVertex: vertex, deletedEdges: deletedEdges};
		}catch (err) {
			throw err;
		}
	}else{
		throw new Error(`You must provide both a key and a collection`);
	}
}

/**
 * Delete an edge
 * @param key {string} the _key of the edge
 * @param collection {string} the edge collection
 * @returns {RawEdge}
 */
export const deleteEdge = async (key: string, collection: EdgeCollections) => {
	if (key && collection) {
		const coll = db.edgeCollection(collection);
		const query = aql`for e in ${coll} filter e._key == ${key} remove {_key: e._key} in ${coll} return OLD`;
		const cursor = await db.query(query);
		const edge = await cursor.next();
		logger.info(`deleted edge with key ${key} in collection ${collection}`);
		return edge;
	}else{
		throw new Error(`You must provide both a key and a collection`);
	}
}

/**
 * Get an array of vertices
 * @param collection
 * @param start
 * @param limit
 */
export const getVerticesByType = async (collection: string, start?: number, limit?: number) => {
	if (collection) {
		try {
			const coll = db.collection(collection);
			const countObj = await coll.count();
			const count = countObj.count;
			const queryArr = [aql`for v in ${coll} sort v.created_date desc`];
			queryArr.push(aql`limit `);
			if (start) {
				queryArr.push(aql`${start}, `);
			}
			queryArr.push(aql`${limit || 100}`);
			queryArr.push(aql`return v`);
			const query = aql.join(queryArr);
			const cursor = await db.query(query);
			const results = await cursor.all();
			return {count, results: results};
		}catch(err) {
			return {count: 0, results: []};
		}
	}else{
		return {count: 0, results: []};
	}
}

/**
 * Get an array of vertices that is connected to startVertexId
 * @param startVertexKey {string}
 * @param startVertexCollection {DocCollections}
 * @param minDepth {number}
 * @param maxDepth {number}
 * @param direction {EdgeTraversalDirections}
 * @param graphName {NamedGraphs}
 * @returns {RawVertex[]}
 */
export const getConnectedVertices = async (
	startVertexKey: string,
	startVertexCollection: DocCollections,
	minDepth: number,
	maxDepth: number,
	direction: EdgeTraversalDirections,
	graphName: NamedGraphs) => {
	if (startVertexKey && startVertexCollection && minDepth && maxDepth && direction && graphName) {
		try {
			const queryStr = `for sv in ${startVertexCollection} filter sv._key == '${startVertexKey}' for v, e, p IN ${minDepth}..${maxDepth} ${direction} sv graph '${graphName}' return v`;
			const query = aql.literal(queryStr);
			const cursor = await db.query(query);
			return await cursor.all();
		}catch (err) {
			throw err;
		}
	}else{
		return null;
	}
}

/**
 * Get an array of edges that is connected to startVertexId
 * @param startVertexKey {string}
 * @param startVertexCollection {DocCollections}
 * @param minDepth {number}
 * @param maxDepth {number}
 * @param direction {EdgeTraversalDirections}
 * @param graphName {NamedGraphs}
 * @returns {RawVertex[]}
 */
export const getConnectedEdges = async (
	startVertexKey: string,
	startVertexCollection: DocCollections,
	minDepth: number,
	maxDepth: number,
	direction: EdgeTraversalDirections,
	graphName: NamedGraphs) => {
	if (startVertexKey && startVertexCollection && minDepth && maxDepth && direction && graphName) {
		try {
			const queryStr = `for sv in ${startVertexCollection} filter sv._key == '${startVertexKey}' for v, e, p IN ${minDepth}..${maxDepth} ${direction} sv graph '${graphName}' return e`;
			const query = aql.literal(queryStr);
			const cursor = await db.query(query);
			return await cursor.all();
		}catch (err) {
			throw err;
		}
	}else{
		return null;
	}
}

/**
 * Get the collection name from an _id
 * @param id {string}
 * @returns {string}
 */
export const getCollectionNameFromId = (id: string) => {
	const idArr = id.split('/');
	return idArr[0];
}

/**
 * Get the collection name from an _id
 * @param id {string}
 * @returns {string}
 */
export const getKeyFromId = (id: string) => {
	const idArr = id.split('/');
	return idArr[1];
}

export const updateVertex = async (key: string, collection: DocCollections, payload: any) => {
	if (key && collection && payload) {
		try {
			const coll = db.collection(collection);
			return await coll.update(key, payload, {returnNew: true});
		}catch(err) {
			throw err;
		}
	}else{
		throw new Error(`You must provide the key, collection and payload`);
	}
}
