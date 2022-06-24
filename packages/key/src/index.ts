import "dotenv/config";
import { initialize } from "@skulpture/serve";

load();

async function load() {
	return listen();
}

async function listen() {
	await initialize();
}
