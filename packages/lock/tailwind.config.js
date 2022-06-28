const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
	mode: "jit",
	content: [
		"./assets/**/*.css",
		"./components/*.{vue,js}",
		"./components/**/*.{vue,js}",
		"./pages/*.vue",
		"./pages/**/*.vue",
		"./layouts/*.vue",
		"./plugins/**/*.{js,ts}",
		"./app.{vue,js,ts}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter var", ...defaultTheme.fontFamily.sans],
			},
		},
	},
	plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
