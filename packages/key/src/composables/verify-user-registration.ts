import { DatabasePubSub } from "@adapters/database/database";
import { WebAuthn } from "@adapters/web-authn/web-authn";
import { User, UserRecord } from "@entities/user/user";

export default function buildVerifyUserRegistration({
	User,
	WebAuthn,
	Database,
}: {
	User: User;
	WebAuthn: WebAuthn;
	Database: DatabasePubSub;
}) {
	return async function verifyUserRegistration(
		user: Pick<UserRecord, "uuid"> & Pick<UserRecord, "clientKey">,
		credential: Record<string, any>,
	) {
		const foundUser = await User.find(user);

		if (!foundUser) throw new Error("Invalid user");
		if (!foundUser.challenge) throw new Error("Invalid challenge");

		const verification = await WebAuthn.verifyRegistrationResponse({
			credential: credential as any,
			expectedChallenge: foundUser.challenge as string,
		});

		if (verification.verified && verification.registrationInfo) {
			const updatedUser = { ...foundUser };

			updatedUser.authenticators?.push({
				credentialID: [...verification.registrationInfo.credentialID],
				credentialPublicKey: [
					...verification.registrationInfo.credentialPublicKey,
				],
				counter: verification.registrationInfo.counter,
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
