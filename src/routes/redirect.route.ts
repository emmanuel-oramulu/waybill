import { Router } from 'express';
import { validate } from "@/middleware/validate.js";
import invalidMethod from "@/middleware/invalidMethod.js";
import { linkController } from "@/controllers/link.controller.js";
import { codeParamSchema } from "@/schemas/link.schema.js";

const router=Router();
router.route("/:code")
	.get(validate(codeParamSchema,"params"),linkController.redirect)
	.all(invalidMethod(["GET"]));

export default router;