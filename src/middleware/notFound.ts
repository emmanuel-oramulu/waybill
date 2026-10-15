import type { Request,Response,NextFunction } from "express";
import { errorBody } from "@/lib/errorResponse.js";

export default function notFound(
	req: Request,
	res: Response,
	next: NextFunction
): void {
	res.status(404).json(errorBody("RESOURCE_NOT_FOUND","Resource not found",{ path: req.originalUrl }));
}