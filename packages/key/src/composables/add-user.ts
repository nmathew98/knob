import { User, UserRecord } from "@entities/user/user";
import { WebAuthn } from "@adapters/web-authn/web-authn";

export default function buildAddUser({
	User,
	WebAuthn,
}: {
	User: User;
	WebAuthn: WebAuthn;
}) {
	return async function addUser(user: UserRecord) {
		const authenticationOptions = WebAuthn.generateAuthenticationOptions(user);

		await User.save({
			...user,
			challenge: authenticationOptions.challenge,
		});

		return authenticationOptions;
	};
}
