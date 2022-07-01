import { doesModuleExist, ServeContext } from "@skulpture/serve";
import {
	GraphQLString,
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLList,
	GraphQLBoolean,
	GraphQLID,
	GraphQLInt,
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
		challenge: {
			type: new GraphQLNonNull(GraphQLString),
		},
		allowCredentials: {
			type: new GraphQLNonNull(
				new GraphQLList(RegistrationPublicKeyCredentialDescriptorJSON),
			),
		},
		timeout: {
			type: new GraphQLNonNull(GraphQLInt),
		},
		userVerification: {
			type: new GraphQLNonNull(GraphQLString),
		},
		extensions: {
			type: RegistrationExtensionsClientInputs,
		},
	}),
});

const RegistrationPublicKeyCredentialDescriptorJSON = new GraphQLObjectType({
	name: "RegistrationPublicKeyCredentialDescriptorJSON",
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
		},
		transports: {
			type: new GraphQLList(GraphQLString),
		},
	}),
});

const RegistrationExtensionsClientInputs = new GraphQLObjectType({
	name: "RegistrationExtensionsClientInputs",
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
