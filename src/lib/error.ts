export class AppError extends Error {
	constructor(
		message: string,
		readonly status: number,
	) {
		super(message);
		this.name=new.target.name;
	}
}

export default class NotFoundError extends AppError {
	constructor(message="Link not found") {
		super(message,404);
	}
}