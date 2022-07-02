import { doesModuleExist, ServeContext } from "@skulpture/serve";
import { GraphQLBoolean, GraphQLNonNull, GraphQLID } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

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
					type: new GraphQLNonNull(GraphQLJSONObject),
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
