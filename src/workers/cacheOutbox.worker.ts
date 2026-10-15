import { linkRepository } from "@/repositories/link.repository.js";
import { cacheDelete,cacheHealthy } from "@/lib/cache.js";
import db from "@/db";

const INTERVAL_MS=3000;
const MAX_RETRIES=5;

let timer: NodeJS.Timeout|undefined;
let current: Promise<void>|undefined;

async function run(): Promise<void> {
	try {
		const [dbUp,cacheUp]=await Promise.all([
			db.healthy(),
			cacheHealthy(),
		]);

		if(!dbUp||!cacheUp) {
			console.warn(
				`Outbox worker skipped: db=${dbUp} cache=${cacheUp}`
			);
			return;
		}

		const jobs=await linkRepository.getPendingJobs();

		for(const { id,code,retries } of jobs) {
			if(retries>=MAX_RETRIES) {
				await linkRepository.updatePendingJob(
					id,
					code,
					"exhausted"
				);
				continue;
			}

			const deleted=await cacheDelete(`link:${code}`);

			await linkRepository.updatePendingJob(
				id,
				code,
				deleted? "done":"pending"
			);
		}
	} catch(error) {
		console.error("Outbox worker error:",error);
	}
}

function tick() {
	if(current) return;

	current=run().finally(() => {
		current=undefined;
	});
}

export function startOutboxWorker(): void {
	if(timer) return;

	timer=setInterval(() => {
		void tick();
	},INTERVAL_MS);

	timer.unref();
}

export async function stopOutboxWorker(): Promise<void> {
	if(timer) {
		clearInterval(timer);
		timer=undefined;
	}

	await current;
}