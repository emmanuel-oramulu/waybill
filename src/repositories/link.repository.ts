import db from "@/db";

export interface UrlRow {
	id: string;
	url: string;
}

export interface PendingJobRow {
	id: string;
	code: string;
	retries: number;
}

type IdRow=Omit<UrlRow,"url">;

class LinkRepository {

	async getURL(code: string): Promise<UrlRow|undefined> {
		const row=await db.query<UrlRow>("SELECT id, url FROM links WHERE code = $1 AND active;",[code]);

		return row[0];
	}

	async setLink(url: string,code: string) {
		await db.query("INSERT INTO links (url, code) VALUES ($1, $2);",[url,code]);
	}

	async setLinkClick(linkId: string): Promise<void> {
		await db.query("INSERT INTO clicks (link_id) VALUES ($1);",[linkId]);
	}

	async getPendingJobs(): Promise<PendingJobRow[]> {
		const rows=await db.query<PendingJobRow>(`
		SELECT id, code, retries FROM cache_outbox 
		WHERE status = 'pending' 
		ORDER BY created_at LIMIT 10;
		`);

		return rows;
	}

	async updatePendingJob(
		id: string,
		code: string,
		status: string="done",
	) {
		await db.query("UPDATE cache_outbox SET status = $1, retries = retries + 1 WHERE code = $2 AND id = $3;",[status,code,id]);
	}

	async deactivationTransaction(code: string) {
		await db.transaction(
			async (client) => {
				await client.query("UPDATE links SET active = False WHERE code = $1;",[code]);

				await client.query("INSERT INTO cache_outbox (code) VALUES ($1)",[code]);
			}
		)
	}
}

export const linkRepository=new LinkRepository();