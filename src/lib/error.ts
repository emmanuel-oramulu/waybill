export class AppError extends Error {
	constructor(
		message: string,
		readonly status: number,
		readonly type: string="APP_ERROR",
	) {
		super(message);
		this.name=new.target.name;
	}
}

export default class NotFoundError extends AppError {
	constructor(message="Link not found") {
		super(message,404,"NOT_FOUND");
	}
}