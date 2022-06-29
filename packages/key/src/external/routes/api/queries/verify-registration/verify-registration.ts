import { doesModuleExist, ServeContext } from "@skulpture/serve";
import {
	GraphQLBoolean,
	GraphQLNonNull,
	GraphQLID,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLInputObjectType,
} from "graphql";

export default function verifyAuthentication(context: ServeContext) {
	doesModuleExist(context, "User", "WebAuthn", "Database");

	const User = context.get("User");
	const WebAuthn = context.get("WebAuthn");
	const Database = context.get("Database");
	const verifyUserRegistration = buildVerifyUserRegistration({
		User,
		WebAuthn,
		Database,
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

const RegistrationCredentialJSON = new GraphQLInputObjectType({
	name: "RegistrationCredentialJSON",
	fields: () => ({
		rawId: {
			type: new GraphQLNonNull(GraphQLString),
		},
		response: {
			type: new GraphQLNonNull(AuthenticatorAttestationResponseJSON),
		},
		clientExtensionResults: {
			type: new GraphQLNonNull(RegistrationExtensionsClientOutputs),
		},
		transports: {
			type: new GraphQLList(GraphQLString),
		},
	}),
});

const AuthenticatorAttestationResponseJSON = new GraphQLInputObjectType({
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

const RegistrationExtensionsClientOutputs = new GraphQLInputObjectType({
	name: "RegistrationExtensionsClientOutputs",
	fields: () => ({
		appid: {
			type: GraphQLBoolean,
		},
		credProps: {
			type: new GraphQLInputObjectType({
				name: "RegistrationCredentialPropertiesOutput",
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
