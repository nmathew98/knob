import { User } from "@entities/user/user";

export default function buildRegisterClientKey({ User }: { User: User }) {
	return async function registerClientKey(key: string) {
		return await User.generateSecret(key);
	};
}
