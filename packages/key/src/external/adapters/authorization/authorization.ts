import { Authorization, H3 } from "@skulpture/serve";
import { sign, verify } from "jsonwebtoken";
import Database from "@adapters/database/database";

const Authorization: Authorization = {
	get: async (_, options?) => {
		if (options && options.sub && options.secret && options.expiresIn) {
			return await signPromisified(
				{ sub: options.sub },
				options.secret,
				options.expiresIn,
			);
		} else throw new Error("No options provided");
	},
	verify: async (request, options?) => {
		const cookie = H3.useCookie(request, "kas-authorization");
		const header = request.headers["KAS-AUTHORIZATION"];

		if (
			(!cookie && !header) ||
			(typeof cookie !== "string" && typeof header !== "string")
		)
			throw new Error("No authorization cookie specified");

		if (!options?.clientKey) throw new Error("Client key not specified");

		const authorizationToken = (cookie || header) as string;

		const secrets = await Database.find({ store: "secrets" });

		if (!secrets) throw new Error("No secrets available");

		const secret = secrets[options.clientKey];

		if (!secret) throw new Error("Unregistered client");

		const authorizationTokenDecoded = await verifyPromisified(
			authorizationToken,
			secret,
		);

		return { authorizationTokenDecoded };
	},
};

export default Authorization;

function verifyPromisified(
	token: string,
	secret: string,
): Promise<string | void> {
	return new Promise((resolve, reject) => {
		verify(token, secret, (error: any, decoded: any) => {
			if (error) return reject(new Error("Token(s) are invalid"));

			return resolve(decoded.sub);
		});
	});
}

function signPromisified(
	options: Record<string, any>,
	secret: string,
	expiresIn: string,
): Promise<string> {
	return new Promise((resolve, reject) => {
		sign(options, secret, { expiresIn }, (error: any, token: any) => {
			if (error) return reject(new Error("Unexpected error occured"));

			return resolve(token);
		});
	});
}
