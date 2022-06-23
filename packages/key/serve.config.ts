export default {
	sentry: {
		dsn: "",
		tracesSampleRate: 1.0,
		environment: "development",
	},
	routes: {
		storage: {
			enabled: false,
		},
	},
	alias: {
		"@composables": "dist/composables",
		"@entities": "dist/entities",
		"@adapters": "dist/external/adapters",
	},
};
