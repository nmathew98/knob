import {
	generateRegistrationOptions,
	verifyRegistrationResponse,
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
	VerifiedAuthenticationResponse,
	VerifiedRegistrationResponse,
	VerifyAuthenticationResponseOpts,
	VerifyRegistrationResponseOpts,
} from "@simplewebauthn/server";
import { Authenticator, UserRecord } from "@entities/user/user";

const rpName = process.env.RP_NAME ?? "Knob";
const rpID = process.env.RP_ID ?? "localhost";
const origin = process.env.RP_ORIGIN ?? `http://localhost:3000`;

const WebAuthn: WebAuthn = {
	generateRegistrationOptions: (
		uuid: string,
		existingAuthenticators: Authenticator[],
	) =>
		generateRegistrationOptions({
			rpName,
			rpID,
			userID: uuid,
			userName: uuid,
			attestationType: "indirect",
			excludeCredentials: existingAuthenticators.map(authenticator => ({
				id: Buffer.from(authenticator.credentialID),
				type: "public-key",
			})),
		}),
	verifyRegistrationResponse: async options =>
		await verifyRegistrationResponse({
			credential: options.credential,
			expectedChallenge: options.expectedChallenge,
			expectedOrigin: origin,
			expectedRPID: rpID,
		}),
	generateAuthenticationOptions: user => {
		const authenticators = user.authenticators;

		return generateAuthenticationOptions({
			allowCredentials: authenticators.map(authenticator => ({
				id: Buffer.from(authenticator.credentialID),
				type: "public-key",
			})),
			userVerification: "preferred",
		});
	},
	verifyAuthenticationResponse: (options, existingAuthenticators) => {
		const authenticator = existingAuthenticators
			.filter(
				authenticator =>
					Buffer.from(authenticator.credentialID).toString() ===
					options.credential.id,
			)
			.map(authenticator => ({
				credentialID: Buffer.from(authenticator.credentialID),
				credentialPublicKey: Buffer.from(authenticator.credentialPublicKey),
				counter: authenticator.counter,
			}))
			.pop();

		if (!authenticator) throw new Error("Authenticator not found");

		return verifyAuthenticationResponse({
			credential: options.credential,
			expectedChallenge: options.expectedChallenge,
			expectedOrigin: origin,
			expectedRPID: rpID,
			authenticator,
		});
	},
};

export default WebAuthn;

export interface WebAuthn {
	generateRegistrationOptions: (
		uuid: string,
		existingAuthenticators: Authenticator[],
	) => Record<string, any>;
	verifyRegistrationResponse: (
		options: Pick<VerifyRegistrationResponseOpts, "credential"> &
			Pick<VerifyAuthenticationResponseOpts, "expectedChallenge">,
	) => Promise<VerifiedRegistrationResponse>;
	generateAuthenticationOptions: (user: UserRecord) => Record<string, any>;
	verifyAuthenticationResponse: (
		options: Pick<VerifyAuthenticationResponseOpts, "credential"> &
			Pick<VerifyAuthenticationResponseOpts, "expectedChallenge">,
		existingAuthenticators: Authenticator[],
	) => VerifiedAuthenticationResponse;
}
