import { readFileSync } from "fs";
import { resolve } from "path";
import { defineNuxtConfig } from "nuxt";

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
	css: ["@/assets/css/styles.css"],
	build: {
		postcss: {
			postcssOptions: require("./postcss.config.js"),
		},
	},
	app: {
		head: {
			link: [
				{
					rel: "stylesheet",
					href: "https://rsms.me/inter/inter.css",
				},
			],
			script: [
				{
					type: "module",
					src: "https://unpkg.com/ionicons@5.0.0/dist/ionicons/ionicons.esm.js",
				},
				{
					nomodule: "",
					src: "https://unpkg.com/ionicons@5.0.0/dist/ionicons/ionicons.js",
				},
			],
		},
	},
	vue: {
		compilerOptions: {
			isCustomElement: (tag: string) => tag.startsWith("ion-"),
		},
	},
	vite: {
		server: {
			https: {
				key: readFileSync(resolve(__dirname, "./localhost+2-key.pem")),
				cert: readFileSync(resolve(__dirname, "./localhost+2.pem")),
			},
			hmr: {
				protocol: "wss",
			},
		},
	},
});
