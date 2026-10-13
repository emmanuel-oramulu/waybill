import { linkRepository } from "@/repositories/link.repository.js";
import { cacheDelete,cacheHealthy } from "@/lib/cache.js";
import db from "@/db";

const INTERVAL_MS=3000;
const MAX_RETRIES=5;

let timer: NodeJS.Timeout|undefined;
let running=false;

async function run(): Promise<void> {
	if(running) return; // previous cycle still going
	running=true;

	try {
		const [dbUp,cacheUp]=await Promise.all([db.healthy(),cacheHealthy()]);
		if(!dbUp||!cacheUp) {
			console.warn(`Outbox worker skipped: db=${dbUp} cache=${cacheUp}`);
			return;
		}

		const jobs=await linkRepository.getPendingJobs();

		for(const { id,code,retries } of jobs) {
			if(retries>=MAX_RETRIES) {
				await linkRepository.updatePendingJob(id,code,"exhausted");
				continue;
			}

			const deleted=await cacheDelete(`link:${code}`);
			await linkRepository.updatePendingJob(
				id,
				code,
				deleted? "done":"pending",
			);
		}
	} catch(error) {
		console.error("Outbox worker error:",error);
	} finally {
		running=false;
	}
}

export function startOutboxWorker(): void {
	timer=setInterval(run,INTERVAL_MS);
	timer.unref();
}

export function stopOutboxWorker(): void {
	if(timer) clearInterval(timer);
}