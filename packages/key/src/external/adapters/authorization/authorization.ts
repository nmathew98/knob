import { Authorization } from "@skulpture/serve";
import { sign } from "jsonwebtoken";

const Authorization: Pick<Authorization, "get"> = {
	get: async (_, options?) => {
		if (options && options.sub && options.secret && options.expiresIn) {
			return await signPromisified(
				{ sub: options.sub },
				options.secret,
				options.expiresIn,
			);
		} else throw new Error("No options provided");
	},
};

export default Authorization;

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
