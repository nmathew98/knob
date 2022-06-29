export const useFrontend = () =>
	process.env.NODE_ENV === "production"
		? process.env.FRONTEND_URI
		: "http://localhost:3000";
