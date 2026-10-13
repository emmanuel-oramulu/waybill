import { Router } from 'express';
import { validate } from "@/middleware/validate.js";
import { linkController } from "@/controllers/link.controller.js";
import { shortenSchema,codeParamSchema } from "@/schemas/link.schema.js";

const router=Router();

router.post("/shorten",validate(shortenSchema),linkController.shorten);
router.get("/:code",validate(codeParamSchema,"params"),linkController.redirect);

export default router;