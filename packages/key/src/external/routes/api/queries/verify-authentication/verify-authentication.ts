import { doesModuleExist, ServeContext } from "@skulpture/serve";
import { GraphQLBoolean, GraphQLNonNull, GraphQLID } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

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
					type: new GraphQLNonNull(GraphQLJSONObject),
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
