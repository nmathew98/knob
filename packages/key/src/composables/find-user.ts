import { User, UserRecord } from "@entities/user/user";

export default function buildFindUser({ User }: { User: User }) {
	return async function findUser(
		user: Pick<UserRecord, "uuid"> & Pick<UserRecord, "clientKey">,
	) {
		return await User.find(user);
	};
}
