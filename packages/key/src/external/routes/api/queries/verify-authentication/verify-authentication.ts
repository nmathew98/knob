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
	doesModuleExist(context, "User", "WebAuthn", "Database");

	const User = context.get("User");
	const WebAuthn = context.get("WebAuthn");
	const Database = context.get("Database");
	const verifyUserAuthentication = buildVerifyUserAuthentication({
		User,
		WebAuthn,
		Database,
	});

	return Object.freeze({
		verifyAuthentication: {
			type: GraphQLBoolean,
			args: {
				uuid: {
					type: new GraphQLNonNull(GraphQLID),
				},
				clientKey: {
					type: new GraphQLNonNull(GraphQLID),
				},
				credential: {
					type: new GraphQLNonNull(AuthenticationCredentialJSON),
				},
			},
			resolve: async (
				_: any,
				{ uuid, clientKey, credential }: VerifyAuthenticationArguments,
			) => await verifyUserAuthentication({ uuid, clientKey }, credential),
		},
	});
}

interface VerifyAuthenticationArguments {
	uuid: string;
	clientKey: string;
	credential: Record<string, any>;
}

const AuthenticationCredentialJSON = new GraphQLObjectType({
	name: "AuthenticationCredentialJSON",
	fields: () => ({
		rawId: {
			type: new GraphQLNonNull(GraphQLString),
		},
		response: {
			type: new GraphQLNonNull(AuthenticatorAssertionResponseJSON),
		},
		clientExtensionResults: {
			type: new GraphQLNonNull(AuthenticationExtensionsClientOutputs),
		},
	}),
});

const AuthenticatorAssertionResponseJSON = new GraphQLObjectType({
	name: "AuthenticatorAssertionResponseJSON",
	fields: () => ({
		clientDataJSON: {
			type: new GraphQLNonNull(GraphQLString),
		},
		attestationObject: {
			type: new GraphQLNonNull(GraphQLString),
		},
		signature: {
			type: new GraphQLNonNull(GraphQLString),
		},
		userHandle: {
			type: GraphQLString,
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
