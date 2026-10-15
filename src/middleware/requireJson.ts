import { type Request,type Response,type NextFunction } from 'express';
import { errorBody } from "@/lib/errorResponse.js";

export default function requireJson(req: Request,res: Response,next: NextFunction) {
	if(req.is("json")!=="json") {
		res.status(415).json(errorBody("UNSUPPORTED_MEDIA_TYPE","Request media type is not supported on this route",{ supportedMedia: ["application/json"] }));
		return;
	}

	next();
}