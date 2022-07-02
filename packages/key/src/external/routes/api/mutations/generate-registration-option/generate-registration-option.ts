import { doesModuleExist, ServeContext } from "@skulpture/serve";
import { GraphQLNonNull, GraphQLID } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default function generateRegistrationOption(context: ServeContext) {
	doesModuleExist(context, "User", "WebAuthn");

	const User = context.get("User");
	const WebAuthn = context.get("WebAuthn");
	const addUser = buildAddUser({ User, WebAuthn });
	const findUser = buildFindUser({ User });
	const registerAuthenticator = buildRegisterAuthenticator({ User, WebAuthn });

	return Object.freeze({
		generateRegistrationOption: {
			type: new GraphQLNonNull(GraphQLJSONObject),
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
