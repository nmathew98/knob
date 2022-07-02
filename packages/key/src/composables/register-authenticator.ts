import { WebAuthn } from "@adapters/web-authn/web-authn";
import { Authenticator, User, UserRecord } from "@entities/user/user";

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

		const authenticationOptions = WebAuthn.generateRegistrationOptions(
			user.uuid,
			foundUser.authenticators as Authenticator[],
		);

		const updatedUser = { ...foundUser };
		updatedUser.challenge = authenticationOptions.challenge;

		await User.update(
			{ uuid: updatedUser.uuid, clientKey: updatedUser.clientKey },
			{ challenge: updatedUser.challenge },
		);

		return authenticationOptions;
	};
}
