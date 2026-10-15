import cors from "cors";
import helmet from "helmet";
import process from "node:process";
import express,{ type Express } from "express";
import db from "@/db";
import corsOptions from "@/config/cors.js";
import { connectCache,closeCache } from "@/lib/cache.js";
import errorHandler from "@/middleware/errorHandler.js";
import notFound from "@/middleware/notFound.js";
import mountRoutes from "@/routes";
import { startOutboxWorker,stopOutboxWorker } from "@/workers/cacheOutbox.worker.js";

const app: Express=express();

app.use(helmet());
app.use(cors(corsOptions));

app.use(express.json({limit: "100kb"}));

mountRoutes(app);

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

			await stopOutboxWorker();
			await new Promise<void>(
				(resolve) => server.close(() => resolve())
			);
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