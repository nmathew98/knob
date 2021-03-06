import { DatabasePubSub } from "@adapters/database/database";
import { WebAuthn } from "@adapters/web-authn/web-authn";
import { User, UserRecord } from "@entities/user/user";

export default function buildVerifyUserAuthentication({
	User,
	WebAuthn,
	Database,
}: {
	User: User;
	WebAuthn: WebAuthn;
	Database: DatabasePubSub;
}) {
	return async function verifyUserAuthentication(
		user: Pick<UserRecord, "uuid"> & Pick<UserRecord, "clientKey">,
		credential: Record<string, any>,
	) {
		const foundUser = await User.find(user);

		if (!foundUser) throw new Error("Invalid user");
		if (!foundUser.challenge) throw new Error("Invalid challenge");
		if (!foundUser.authenticators) throw new Error("Invalid authenticators");

		const verification = WebAuthn.verifyAuthenticationResponse(
			{
				credential: credential as any,
				expectedChallenge: foundUser.challenge as string,
			},
			foundUser.authenticators,
		);

		if (verification.verified && verification.authenticationInfo) {
			const authenticator = foundUser.authenticators
				.filter(
					authenticator =>
						Buffer.from(authenticator.credentialID).toString() ===
						credential.id,
				)
				.map(authenticator => ({
					credentialID: authenticator.credentialID,
					credentialPublicKey: authenticator.credentialPublicKey,
					counter: authenticator.counter,
				}))
				.pop();

			if (!authenticator) throw new Error("Authenticator not found");

			if (verification.authenticationInfo.newCounter < authenticator.counter)
				throw new Error("Invalid authenticator");

			authenticator.counter = verification.authenticationInfo.newCounter;

			const updatedUser = { ...foundUser };
			updatedUser.authenticators?.map(a => {
				if (a.credentialID !== authenticator.credentialID) return a;

				return authenticator;
			});

			await User.update(
				{ uuid: foundUser.uuid, clientKey: foundUser.clientKey },
				{ authenticators: updatedUser.authenticators },
			);
		}

		await Database.publish(
			"verification",
			JSON.stringify({
				uuid: foundUser.uuid,
				clientKey: foundUser.clientKey,
				verified: verification.verified,
				secret: foundUser.secret,
			}),
		);

		return verification.verified;
	};
}
