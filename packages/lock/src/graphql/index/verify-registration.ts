const buildQuery = (
	uuid: string,
	clientKey: string,
	credential: RegistrationCredentialJSON,
) => ({
	query: {
		verifyRegistration: {
			__args: {
				uuid,
				clientKey,
				credential,
			},
		},
	},
});

export default buildQuery;

export interface RegistrationCredentialJSON {
	rawId: string;
	response: AuthenticatorAttestationResponseJSON;
	clientExtensionResults: AuthenticationExtensionsClientOutputs;
	transports: string[];
}

export interface AuthenticatorAttestationResponseJSON {
	clientDataJSON: string;
	attestationObject: string;
}

export interface AuthenticationExtensionsClientOutputs {
	appid?: boolean;
	credProps?: {
		rk?: boolean;
	};
	uvm?: number[][];
}
