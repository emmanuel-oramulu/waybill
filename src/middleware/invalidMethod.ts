import type { Request,Response } from "express";
import { errorBody } from "@/lib/errorResponse.js";

const invalidMethod=
	(allowedMethods: string[]) => (_req: Request,res: Response) => {
		res.set("Allow",allowedMethods.join(", ").toUpperCase());
		res
			.status(405)
			.json(
				errorBody("METHOD_NOT_ALLOWED","Method Not Allowed",{
					allowed: allowedMethods,
				}),
			);
	};

export default invalidMethod;