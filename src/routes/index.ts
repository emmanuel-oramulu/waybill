import { type Express } from "express";
import link from "@/routes/link.route.js";
import redirect from "@/routes/redirect.route.js";

function mountRoutes(app: Express) {
	app.use("/api/link",link);
	app.use(redirect)
}

export default mountRoutes;