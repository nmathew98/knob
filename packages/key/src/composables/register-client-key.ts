import { User } from "@entities/user/user";

export default function buildRegisterClientKey({ User }: { User: User }) {
	return async function registerClientKey(key: string | void) {
		return await User.generateSecret(key);
	};
}
