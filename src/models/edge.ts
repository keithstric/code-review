export interface RawEdge {
	_from: string;
	_to: string;
	_created_date?: string;
	[key: string]: any;
}

export class Edge implements RawEdge {
	_from: string;
	_to: string;
	_created_date: string;

	constructor(rawEdge: RawEdge) {
		Object.assign(this, rawEdge);
	}
}
