import type { Request,Response,NextFunction } from "express";
import { z,type ZodType } from "zod";
import { errorBody } from "@/lib/errorResponse.js";

export const validate=
	(schema: ZodType,source: "body"|"params"="body",failStatus=400) =>
		(req: Request,res: Response,next: NextFunction) => {
			
			const result=schema.safeParse(req[source]);

			if(!result.success) {
				if(failStatus===404) {
					res.status(404).json(errorBody("NOT_FOUND","Link not found"));
					return;
				}
				res
					.status(400)
					.json(
						errorBody(
							"VALIDATION_ERROR",
							"Invalid request",
							z.flattenError(result.error),
						),
					);
				return;
			}

			req[source]=result.data;
			next();
		};