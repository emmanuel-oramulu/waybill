import { createClient } from "redis";

const client=createClient({
	url: process.env.REDIS_ENDPOINT_URI??"redis://127.0.0.1:6379",
});

client.on("error",(err) => console.error("Redis error: ",err))

export async function connectCache(): Promise<void> {
	await client.connect();
}

export async function closeCache(): Promise<void> {
	await client.close();
}

export async function cacheGet<T>(key: string): Promise<T|undefined> {
	try {
		const raw=await client.get(key);
		return raw? (JSON.parse(raw) as T):undefined;
	} catch(error) {
		console.error("cacheGet failed:",error);
		return undefined;
	}
}

export async function cacheSet<T>(
	key: string,
	value: unknown,
	ttlSeconds=3600
): Promise<void> {
	try {
		await client.set(
			key,
			JSON.stringify(value),
			{ EX: ttlSeconds }
		);
	} catch(error) {
		console.error("cacheSet failed:",error);
	}
}

export async function cacheDelete(key: string): Promise<boolean> {
	try {
		await client.del(key);
		return true;
	} catch(error) {
		console.error("cacheDelete failed:",error);
		return false;
	}
}

export async function cacheHealthy(): Promise<boolean> {
	try {
		if(client.isReady&&await client.ping()==="PONG") return true;

		return false;
	} catch(error) {
		return false
	}
}