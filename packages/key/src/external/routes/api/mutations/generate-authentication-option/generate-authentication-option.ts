import { doesModuleExist, ServeContext } from "@skulpture/serve";
import { GraphQLNonNull, GraphQLID } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default function generateAuthenticationOption(context: ServeContext) {
	doesModuleExist(context, "User", "WebAuthn");

	const User = context.get("User");
	const WebAuthn = context.get("WebAuthn");
	const authenticateUser = buildAuthenticateUser({ User, WebAuthn });

	return Object.freeze({
		generateAuthenticationOption: {
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
				{ uuid, clientKey }: GenerateAuthenticationOptionArguments,
			) => await authenticateUser({ uuid, clientKey }),
		},
	});
}

interface GenerateAuthenticationOptionArguments {
	uuid: string;
	clientKey: string;
}
