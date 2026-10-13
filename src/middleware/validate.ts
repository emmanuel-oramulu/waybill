import type { Request,Response,NextFunction } from "express";
import { z,type ZodType } from "zod";

export const validate=
	(schema: ZodType,source: "body"|"params"="body") =>
		(req: Request,res: Response,next: NextFunction) => {
			const result=schema.safeParse(req[source]);

			if(!result.success) {
				res.status(400).json({ error: z.flattenError(result.error) });
				return;
			}

			req[source]=result.data;
			next();
		};