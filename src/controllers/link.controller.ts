import type { Request,Response } from "express";
import { linkService } from "@/services/link.service.js";

const BASE_URL=process.env.BASE_URL??"http://localhost:4500";

class LinkController {
	async shorten(req: Request,res: Response) {
		const { url }=req.body as { url: string };
		const code=await linkService.create(url);
		res.status(201).json({ code,short: `${BASE_URL}/${code}` });
	}

	async redirect(req: Request,res: Response) {
		const { link,cache }=await linkService.resolve(String(req.params.code));
		res.set("X-Waybill-Cache",cache).redirect(302,link.url);
	}
}

export const linkController=new LinkController();