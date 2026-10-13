import { Pool } from "pg";
import type { PoolClient,QueryResultRow } from "pg";

class Database {
	private pool: Pool;

	constructor() {
		this.pool=new Pool({
			onConnect: async (client) => {
				await client.query("SET search_path TO waybill_schema;");
			},
			host: "/data/data/com.termux/files/usr/tmp",
			database: "waybill_db",
			user: "u0_a331",
			connectionTimeoutMillis: 5000,
			query_timeout: 3000
		});

		this.pool.on(
			"error",
			(err) => {
				console.error(`[${new Date().toLocaleString()}] - 🔴 Error: Unexpected pg poop connection error: `,err)
			}
		);
	}

	async init() {
		const { rows }=await this.pool.query("SHOW search_path;");

		if(rows[0].search_path!=="waybill_schema") {
			throw new Error(`Wrong search_path: ${rows[0].search_path}`);
		}

		console.log(`[${new Date().toLocaleString()}] - 🔵 Info: Database connection was successful`)
	}

	async query<T extends QueryResultRow=QueryResultRow>(
		text: string,
		params: unknown[]=[],
	): Promise<T[]> {
		const result=await this.pool.query<T>(text,params);
		return result.rows;
	}

	async transaction<T>(fn: (client: PoolClient) => Promise<T>) {
		const client=await this.pool.connect();
		try {
			await client.query("BEGIN");
			const result=await fn(client);
			await client.query("COMMIT");
		} catch(error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	async healthy(): Promise<boolean> {
		let client;
		let success=false;
		try {
			client=await this.pool.connect();

			await Promise.race([
				client.query("SELECT 1"),
				new Promise((_,reject) => setTimeout(() => reject(),3000).unref())
			]);

			success=true;
			return true;
		} catch(error) {
			return false;
		} finally {
			if(client) client.release(!success);
		}
	}

	async close(): Promise<void> {
		await this.pool.end();
	}
}

export default new Database();