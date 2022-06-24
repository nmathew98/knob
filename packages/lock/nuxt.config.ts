import { defineNuxtConfig } from "nuxt";

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
	css: ["@/assets/css/styles.css"],
	build: {
		postcss: {
			postcssOptions: require("./postcss.config.js"),
		},
	},
});
