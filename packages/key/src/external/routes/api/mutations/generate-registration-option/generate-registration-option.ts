import { doesModuleExist, ServeContext } from "@skulpture/serve";
import {
	GraphQLString,
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLList,
	GraphQLBoolean,
	GraphQLID,
} from "graphql";

export default function generateRegistrationOption(context: ServeContext) {
	doesModuleExist(context, "User", "WebAuthn");

	const User = context.get("User");
	const WebAuthn = context.get("WebAuthn");
	const addUser = buildAddUser({ User, WebAuthn });
	const findUser = buildFindUser({ User });
	const registerAuthenticator = buildRegisterAuthenticator({ User, WebAuthn });

	return Object.freeze({
		generateRegistrationOption: {
			type: PublicKeyCredentialCreationOptionsJSON,
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
				{ uuid, clientKey }: GenerateRegistrationOptionArguments,
			) => {
				const foundUser = await findUser({ uuid, clientKey });

				if (!foundUser)
					return await addUser({
						uuid,
						clientKey,
						authenticators: [],
					});

				return await registerAuthenticator({ uuid, clientKey });
			},
		},
	});
}

interface GenerateRegistrationOptionArguments {
	uuid: string;
	clientKey: string;
}

const PublicKeyCredentialCreationOptionsJSON = new GraphQLObjectType({
	name: "PublicKeyCredentialCreationOptionsJSON",
	fields: () => ({
		user: {
			type: new GraphQLNonNull(PublicKeyCredentialUserEntityJSON),
		},
		challenge: {
			type: new GraphQLNonNull(GraphQLString),
		},
		allowCredentials: {
			type: PublicKeyCredentialDescriptorJSON,
		},
		extensions: {
			type: AuthenticationExtensionsClientInputs,
		},
	}),
});

const PublicKeyCredentialUserEntityJSON = new GraphQLObjectType({
	name: "PublicKeyCredentialUserEntityJSON",
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
		},
	}),
});

const PublicKeyCredentialDescriptorJSON = new GraphQLObjectType({
	name: "PublicKeyCredentialDescriptorJSON",
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
