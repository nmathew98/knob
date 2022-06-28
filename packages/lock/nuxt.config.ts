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
});
