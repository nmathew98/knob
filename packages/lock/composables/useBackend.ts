export const useBackend = () =>
	process.env.NODE_ENV === "production"
		? process.env.BACKEND_URI
		: "http://localhost:4000";
