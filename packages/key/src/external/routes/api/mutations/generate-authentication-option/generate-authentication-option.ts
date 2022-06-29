import { doesModuleExist, ServeContext } from "@skulpture/serve";
import {
	GraphQLString,
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLList,
	GraphQLBoolean,
	GraphQLID,
} from "graphql";

export default function generateAuthenticationOption(context: ServeContext) {
	doesModuleExist(context, "User", "WebAuthn");

	const User = context.get("User");
	const WebAuthn = context.get("WebAuthn");
	const authenticateUser = buildAuthenticateUser({ User, WebAuthn });

	return Object.freeze({
		generateAuthenticationOption: {
			type: PublicKeyCredentialRequestOptionsJSON,
			args: {
				uuid: {
					type: new GraphQLNonNull(GraphQLID),
				},
				clientKey: {
					type: new GraphQLNonNull(GraphQLID),
				},
			},
			resolve: async (
				_: any,
				{ uuid, clientKey }: GenerateAuthenticationOptionArguments,
			) => await authenticateUser({ uuid, clientKey }),
		},
	});
}

interface GenerateAuthenticationOptionArguments {
	uuid: string;
	clientKey: string;
}

const PublicKeyCredentialRequestOptionsJSON = new GraphQLObjectType({
	name: "PublicKeyCredentialRequestOptionsJSON",
	fields: () => ({
		challenge: {
			type: new GraphQLNonNull(GraphQLString),
		},
		allowCredentials: {
			type: new GraphQLList(AuthenticationPublicKeyCredentialDescriptorJSON),
		},
		extensions: {
			type: AuthenticationExtensionsClientInputs,
		},
	}),
});

const AuthenticationPublicKeyCredentialDescriptorJSON = new GraphQLObjectType({
	name: "AuthenticationPublicKeyCredentialDescriptorJSON",
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
		},
		transports: {
			type: new GraphQLList(GraphQLString),
		},
	}),
});

const AuthenticationExtensionsClientInputs = new GraphQLObjectType({
	name: "AuthenticationExtensionsClientInputs",
	fields: () => ({
		appid: {
			type: GraphQLString,
		},
		appidExclude: {
			type: GraphQLString,
		},
		credProps: {
			type: GraphQLString,
		},
		uvm: {
			type: GraphQLBoolean,
		},
	}),
});
