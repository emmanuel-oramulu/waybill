import { randomInt } from "node:crypto"
import { linkRepository,type UrlRow } from "@/repositories/link.repository.js";
import NotFoundError from "@/lib/error.js";
import { cacheGet,cacheSet } from "@/lib/cache.js";

const ALPHABET="ABCDEF0GHIJKLMN3OP9QR6STU1VWX7YZa2bcdefghijklmn85opqrstu4vwxyz";

class LinkService {
	private generateCode(length: number=7) {
		let code="";

		for(let i=0;i<length;i++) {
			code+=ALPHABET.charAt(randomInt(ALPHABET.length));
		}

		return code;
	}

	async create(url: string): Promise<string> {
		for(let attempt=1;attempt<=5;attempt++) {
			try {
				const code=this.generateCode()
				await linkRepository.setLink(url,code);

				return code;
			} catch(error) {
				if(error instanceof Error&&"code" in error&&error.code==="23505") {
					continue;
				}

				throw error;
			}
		}
		throw new Error("Could not generate a unique code");
	}

	async resolve(code: string): Promise<{ link: UrlRow,cache: "HIT"|"MISS" }> {
		const key=`link:${code}`;

		const cached=await cacheGet<UrlRow>(key);

		if(cached) return { link: cached,cache: "HIT" };

		const row=await linkRepository.getURL(code);

		if(!row) throw new NotFoundError("Link not found");

		cacheSet(key,row)

		return { link: row,cache: "MISS" };
	}

	async deactivate(code: string) {
		await linkRepository.deactivationTransaction(code);
	}
};


export const linkService=new LinkService();