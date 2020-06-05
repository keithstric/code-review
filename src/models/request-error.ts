export class RequestError extends Error {
	status: number;

	constructor(msg: string, status: number) {
		super(msg);
		this.status = status;
	}

}
