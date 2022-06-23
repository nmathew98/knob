import "dotenv/config";
import {
	useProjectConfiguration,
	useEntityConfiguration,
	initialize,
} from "@skulpture/serve";

load();

async function load() {
	return initializeProjectConfiguration()
		.then(initializeEntityConfiguration)
		.then(listen);
}

async function initializeProjectConfiguration() {
	useProjectConfiguration(async () => {});
}

async function initializeEntityConfiguration() {
	useEntityConfiguration(async () => {});
}

async function listen() {
	await initialize();
}
