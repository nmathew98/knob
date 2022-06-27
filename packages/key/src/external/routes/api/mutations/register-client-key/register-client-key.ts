import { doesModuleExist, ServeContext } from "@skulpture/serve";
import { GraphQLNonNull, GraphQLString, GraphQLID } from "graphql";

export default function registerClientKey(context: ServeContext) {
	doesModuleExist(context, "User");

	const User = context.get("User");
	const registerClientKey = buildRegisterClientKey({ User });

	return Object.freeze({
		registerClientKey: {
			type: new GraphQLNonNull(GraphQLString),
			args: {
				clientKey: new GraphQLNonNull(GraphQLID),
			},
			resolve: async (_: any, { clientKey }: RegisterClientKeyArguments) =>
				await registerClientKey(clientKey),
		},
	});
}

interface RegisterClientKeyArguments {
	clientKey: string;
}
