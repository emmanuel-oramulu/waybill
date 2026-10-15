import type { ErrorRequestHandler } from "express";
import { AppError } from "@/lib/error.js";
import { errorBody } from "@/lib/errorResponse.js";

const errorHandler: ErrorRequestHandler=(err,_req,res,next) => {
	if(res.headersSent) {
		next(err);
		return;
	}

	if(err instanceof AppError) {
		if(err.status>=500) console.error(err);
		res.status(err.status).json(errorBody(err.type,err.message));
		return;
	}

	const status=typeof err?.status==="number"? err.status:undefined;
	if(status!==undefined&&status>=400&&status<500) {
		if(status===400&&err?.type==="entity.parse.failed") {
			res.status(400).json(errorBody("INVALID_JSON","Request body contains invalid JSON"));
		} else if(status===413&&err?.type==="entity.too.large") {
			res.status(413).json(errorBody("PAYLOAD_TOO_LARGE","Request body exceeds the allowed size"));
		} else {
			res.status(status).json(errorBody("BAD_REQUEST","Bad request"));
		}
		return;
	}

	console.error("Unknown error:",err);
	res
		.status(500)
		.json(errorBody("INTERNAL_SERVER_ERROR","An unexpected error occurred"));
};

export default errorHandler;