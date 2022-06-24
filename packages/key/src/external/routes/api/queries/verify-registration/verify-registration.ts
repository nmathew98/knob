import { doesModuleExist, ServeContext } from "@skulpture/serve";
import {
	GraphQLBoolean,
	GraphQLNonNull,
	GraphQLID,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
} from "graphql";

export default function verifyAuthentication(context: ServeContext) {
	doesModuleExist(context, "User", "WebAuthn");

	const User = context.get("User");
	const WebAuthn = context.get("WebAuthn");
	const verifyUserRegistration = buildVerifyUserRegistration({
		User,
		WebAuthn,
	});

	return Object.freeze({
		verifyRegistration: {
			type: GraphQLBoolean,
			args: {
				uuid: {
					type: new GraphQLNonNull(GraphQLID),
				},
				clientKey: {
					type: new GraphQLNonNull(GraphQLID),
				},
				credential: {
					type: new GraphQLNonNull(RegistrationCredentialJSON),
				},
			},
			resolve: async (
				_: any,
				{ uuid, clientKey, credential }: VerifyRegistrationArguments,
			) => await verifyUserRegistration({ uuid, clientKey }, credential),
		},
	});
}

interface VerifyRegistrationArguments {
	uuid: string;
	clientKey: string;
	credential: Record<string, any>;
}

const RegistrationCredentialJSON = new GraphQLObjectType({
	name: "RegistrationCredentialJSON",
	fields: () => ({
		rawId: {
			type: new GraphQLNonNull(GraphQLString),
		},
		response: {
			type: new GraphQLNonNull(AuthenticatorAttestationResponseJSON),
		},
		clientExtensionResults: {
			type: new GraphQLNonNull(AuthenticationExtensionsClientOutputs),
		},
		transports: {
			type: new GraphQLList(GraphQLString),
		},
	}),
});

const AuthenticatorAttestationResponseJSON = new GraphQLObjectType({
	name: "AuthenticatorAttestationResponseJSON",
	fields: () => ({
		clientDataJSON: {
			type: new GraphQLNonNull(GraphQLString),
		},
		attestationObject: {
			type: new GraphQLNonNull(GraphQLString),
		},
	}),
});

const AuthenticationExtensionsClientOutputs = new GraphQLObjectType({
	name: "AuthenticationExtensionsClientOutputs",
	fields: () => ({
		appid: {
			type: GraphQLBoolean,
		},
		credProps: {
			type: new GraphQLObjectType({
				name: "CredentialPropertiesOutput",
				fields: () => ({
					rk: {
						type: GraphQLBoolean,
					},
				}),
			}),
		},
		uvm: {
			type: new GraphQLList(new GraphQLList(GraphQLInt)),
		},
	}),
});
