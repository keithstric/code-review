import {RawVertex, Vertex} from './vertex';

export interface RawCRBranch extends RawVertex {
	name: string;
}

export class CRBranch extends Vertex implements RawCRBranch {
	name: string;

	constructor(rawBranch: RawCRBranch) {
		super(rawBranch);
		Object.assign(this, rawBranch);
	}

}
