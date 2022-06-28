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
					src: "https://unpkg.com/ionicons@5.0.0/dist/ionicons.js",
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
