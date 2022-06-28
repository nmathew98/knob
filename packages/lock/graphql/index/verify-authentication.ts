const buildQuery = (
	uuid: string,
	clientKey: string,
	credential: AuthenticationCredentialJSON,
) => ({
	query: {
		verifyAuthentication: {
			__args: {
				uuid,
				clientKey,
				credential,
			},
		},
	},
});

export default buildQuery;

export interface AuthenticationCredentialJSON {
	rawId: string;
	response: AuthenticatorAssertionResponseJSON;
	clientExtensionResults: AuthenticationExtensionsClientOutputs;
}

export interface AuthenticatorAssertionResponseJSON {
	clientDataJSON: string;
	attestationObject: string;
	signature: string;
	userHandle?: string;
}

export interface AuthenticationExtensionsClientOutputs {
	appid?: boolean;
	credProps?: {
		rk?: boolean;
	};
	uvm?: number[][];
}
