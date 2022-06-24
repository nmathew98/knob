import { User, UserRecord } from "@entities/user/user";

export default function buildDeleteUser({ User }: { User: User }) {
	return async function deleteUser(
		identifiers: Pick<UserRecord, "uuid"> & Pick<UserRecord, "clientKey">,
	) {
		return await User.delete(identifiers);
	};
}
