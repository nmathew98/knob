import { WebAuthn } from "@adapters/web-authn/web-authn";
import { User, UserRecord } from "@entities/user/user";

export default function buildRegisterAuthenticator({
	User,
	WebAuthn,
}: {
	User: User;
	WebAuthn: WebAuthn;
}) {
	return async function registerAuthenticator(
		user: Pick<UserRecord, "uuid"> & Pick<UserRecord, "clientKey">,
	) {
		const foundUser = await User.find(user);

		if (!foundUser) throw new Error("Invalid user");

		const authenticationOptions =
			WebAuthn.generateAuthenticationOptions(foundUser);

		const updatedUser = { ...foundUser };
		updatedUser.challenge = authenticationOptions.challenge;

		await User.update(
			{ uuid: updatedUser.uuid, clientKey: updatedUser.clientKey },
			{ challenge: updatedUser.challenge },
		);

		return updatedUser;
	};
}
