import { Database as UserDatabase } from "@entities/user/user";
import { Consola } from "@skulpture/serve";
import { createClient } from "redis";
import crypto from "crypto";

const redisClientOptions = { url: process.env.REDIS_CLIENT };

let isRedisConnected = false;
let redis: ReturnType<typeof createClient>;

const Database: UserDatabase = {
	use: async () => {
		if (!redisClientOptions.url) throw new Error("Redis client not specified");

		if (!redis) {
			redis = createClient(redisClientOptions);

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

		return result as Record<string, any> | null;
	},
	update: async (identifiers, updates) => {
		if (!isRedisConnected) throw new Error("Redis client not connected");

		const existing =
			(await redis.json.get(md5(identifiers))) || Object.create(null);

		const updated = {
			...existing,
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
};

export default Database;

function md5(x: Record<string, any>) {
	return crypto.createHash("md5").update(JSON.stringify(x)).digest("hex");
}
