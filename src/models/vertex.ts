export interface RawVertex {
	_key?: string;
	_id?: string;
	_rev?: string;
	[key: string]: any;
	created_date?: string;
}

export class Vertex implements RawVertex {
	_key?: string;
	_id?: string;
	_rev?: string;

	constructor(raw: RawVertex) {
		Object.assign(this, raw);
	}
}
