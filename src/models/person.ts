import {RawVertex, Vertex} from './vertex';

export interface RawPerson extends RawVertex {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	verify_password?: string;
	avatar?: string;
}

export class Person extends Vertex implements RawPerson {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	verify_password: string;

	constructor(raw: RawPerson) {
		super(raw);
		Object.assign(this, raw);
	}

	get fullName() {
		return `${this.first_name} ${this.last_name}`;
	}
}
