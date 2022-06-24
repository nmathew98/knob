import { Database as UserDatabase } from "@entities/user/user";
import { Consola } from "@skulpture/serve";
import { createClient } from "redis";
import crypto from "crypto";

const redisClientOptions = { url: process.env.REDIS_CLIENT };

let isRedisConnected = false;
let redis: ReturnType<typeof createClient>;

const clients = Object.create(null);

const Database: UserDatabase & DatabasePubSub = {
	use: async () => {
		if (!redisClientOptions.url) throw new Error("Redis client not specified");

		if (!redis) {
			redis = createClient(redisClientOptions);

			redis.connect();

			redis.on("connect", () => {
				isRedisConnected = true;
				Consola.log(`Connected to Redis at ${redisClientOptions.url}`);
			});
			redis.on("error", () => {
				Consola.error(
					`Unable to connect to Redis at ${redisClientOptions.url}`,
				);
			});
		}
	},
	create: async (identifiers, document) => {
		if (!isRedisConnected) throw new Error("Redis client not connected");

		await redis.json.set(md5(identifiers), "$", document);

		return document;
	},
	find: async identifiers => {
		if (!isRedisConnected) throw new Error("Redis client not connected");

		const result = await redis.json.get(md5(identifiers));

		if (!result) return null;

		return result as Record<string, any>;
	},
	update: async (identifiers, updates) => {
		if (!isRedisConnected) throw new Error("Redis client not connected");

		const existing = await redis.json.get(md5(identifiers));

		if (!existing) throw new Error("Unable to find document");

		const updated = {
			...(existing as Record<string, any>),
			...updates,
		};

		await redis.json.set(md5(identifiers), "$", updated);

		return updated;
	},
	delete: async identifiers => {
		if (!isRedisConnected) throw new Error("Redis client not connected");

		const deleteCount = await redis.json.del(md5(identifiers));

		return deleteCount;
	},
	publish: async (channel: string, message: string) => {
		if (!clients[channel]) clients[channel] = redis.duplicate();

		await clients[channel].publish(channel, message);
	},
	subscribe: async (
		channel: string,
		handler: (message: string, channel: string) => void,
	) => {
		const client = redis.duplicate();
		await client.subscribe(channel, handler);

		return client;
	},
	unsubscribe: async (client: any, channel: string) => {
		await client.unsubscribe(channel);
		await client.quit();
	},
};

export default Database;

export interface DatabasePubSub {
	publish: (channel: string, message: string) => Promise<void>;
	subscribe: (
		channel: string,
		handler: (message: string, channel: string) => void,
	) => Promise<any>;
	unsubscribe: (client: any, channel: string) => Promise<void>;
}

function md5(x: Record<string, any>) {
	return crypto.createHash("md5").update(JSON.stringify(x)).digest("hex");
}
