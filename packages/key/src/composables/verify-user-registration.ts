import { WebAuthn } from "@adapters/web-authn/web-authn";
import { User, UserRecord } from "@entities/user/user";

export default function buildVerifyUserRegistration({
	User,
	WebAuthn,
}: {
	User: User;
	WebAuthn: WebAuthn;
}) {
	return async function verifyUserRegistration(
		user: Pick<UserRecord, "uuid"> & Pick<UserRecord, "clientKey">,
		credential: Record<string, any>,
	) {
		const foundUser = await User.find(user);

		if (!foundUser) throw new Error("Invalid user");
		if (!foundUser.challenge) throw new Error("Invalid challenge");

		return WebAuthn.verifyRegistrationResponse({
			credential: credential as any,
			expectedChallenge: foundUser.challenge as string,
		});
	};
}
