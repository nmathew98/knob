import { doesModuleExist, ServeContext } from "@skulpture/serve";
import {
	GraphQLNonNull,
	GraphQLString,
	GraphQLID,
	GraphQLObjectType,
} from "graphql";

export default function registerClientKey(context: ServeContext) {
	doesModuleExist(context, "User");

	const User = context.get("User");
	const registerClientKey = buildRegisterClientKey({ User });

	return Object.freeze({
		registerClientKey: {
			type: new GraphQLNonNull(ClientRegistrationInformation),
			args: {
				clientKey: GraphQLID,
			},
			resolve: async (_: any, { clientKey }: RegisterClientKeyArguments) =>
				await registerClientKey(clientKey),
		},
	});
}

interface RegisterClientKeyArguments {
	clientKey: string | void;
}

const ClientRegistrationInformation = new GraphQLObjectType({
	name: "ClientRegistrationInformation",
	description: "The secret and UUID associated with a client",
	fields: () => ({
		secret: {
			type: new GraphQLNonNull(GraphQLString),
		},
		key: {
			type: new GraphQLNonNull(GraphQLString),
		},
	}),
});
