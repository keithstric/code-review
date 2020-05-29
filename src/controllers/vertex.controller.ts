import {aql, Database} from 'arangojs';
import {Request, Response} from 'express';
import {createVertex, getVertexByPropertyName} from '../helpers/db-utils';
import {getDbConn} from '../config/arango.config';
import {logger} from '../config/logger/logger';
import {Vertex} from '../models/vertex';

const db: Database = getDbConn();

export class VertexController {
	vertex: Vertex;

	constructor(vertex?: Vertex) {
		this.vertex = vertex;
	}

	async findVertexByProperty(propertyName: string, propertyValue: string|number, collection: string) {
		if (propertyName && propertyValue && collection) {
			return await getVertexByPropertyName(propertyName, propertyValue, collection);
		}else{
			return null;
		}
	}

	async createVertex(vertexObj: any, collection: string) {
		if (vertexObj && collection) {
			return await createVertex(vertexObj, collection);
		}else{
			return null;
		}
	}

}
