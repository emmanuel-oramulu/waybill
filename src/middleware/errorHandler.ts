import type { Request,Response,NextFunction } from "express";
import { AppError } from "@/lib/error.js";

export default function errorHandler(
	err: unknown,
	_req: Request,
	res: Response,
	next: NextFunction,
) {
	if(res.headersSent) {
		next(err);
		return;
	}

	if(err instanceof AppError) {
		if(err.status>=500) console.error(err);
		res.status(err.status).json({ error: { message: err.message } });
		return;
	}

	console.error("Unknown error:",err);
	res.status(500).json({ error: { message: "Internal server error" } });
}