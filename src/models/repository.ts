import {RawVertex, Vertex} from './vertex';

export interface RawCRRepository extends RawVertex {
	url?: string;
	name?: string;
	path?: string;
}

export class CRRepository extends Vertex implements RawCRRepository {
	url?: string;
	name?: string;
	path?: string;

	constructor(rawRepo: RawCRRepository) {
		super(rawRepo);
		Object.assign(this, rawRepo);
	}
}
