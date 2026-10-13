import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import process from "node:process";
import express,{ type Express } from "express";
import db from "@/db";
import { connectCache,closeCache } from "@/lib/cache.js";
import errorHandler from "@/middleware/errorHandler.js";
import notFound from "@/middleware/notFound.js";
import linkRoutes from "@/routes/link.route.js";
import { startOutboxWorker,stopOutboxWorker } from "@/workers/cacheOutbox.worker.js";

const app: Express=express();

app.use(helmet());
app.use(cors());

app.use(express.json());

app.use(linkRoutes);

app.use(notFound);
app.use(errorHandler);

async function boot() {
	try {
		await db.init();
		await connectCache();
		startOutboxWorker();

		const PORT: number=parseInt(process.env.PORT??"4500",10);

		const server=app.listen(
			PORT,
			() => {
				console.log(`[${new Date().toLocaleString()}] - 🔵 Info: Server is listening at ${PORT}`);
			}
		);


		let shuttingDown=false;
		const shutdown=async () => {
			if(shuttingDown) return;

			shuttingDown=true;
			console.log('Shutting down...');

			setTimeout(() => process.exit(1),10_000).unref();

			await new Promise<void>(
				(resolve) => server.close(() => resolve())
			);

			stopOutboxWorker();
			await db.close();
			await closeCache();
			process.exit(0);
		}

		process.on("SIGTERM",shutdown);
		process.on("SIGINT",shutdown);
	} catch(error) {
		console.error('Failed to start server:',error);
		process.exit(1);
	}
}

await boot();