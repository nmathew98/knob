export const useBackend = () =>
	process.env.NODE_ENV === "production"
		? process.env.BACKEND_URI
		: "https://localhost:4000";
