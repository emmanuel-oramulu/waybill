import { Router } from 'express';
import { validate } from "@/middleware/validate.js";
import invalidMethod from "@/middleware/invalidMethod.js";
import { linkController } from "@/controllers/link.controller.js";
import { shortenSchema,codeParamSchema } from "@/schemas/link.schema.js";
import requireJson from "@/middleware/requireJson.js"

const router=Router();

router.route("/shorten")
	.post(requireJson, validate(shortenSchema),linkController.shorten)
	.all(invalidMethod(["POST"]));

export default router;