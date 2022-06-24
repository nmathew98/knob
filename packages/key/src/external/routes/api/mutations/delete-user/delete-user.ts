import { doesModuleExist, ServeContext } from "@skulpture/serve";
import { GraphQLBoolean, GraphQLID, GraphQLNonNull } from "graphql";

export default function deleteUser(context: ServeContext) {
	doesModuleExist(context, "User");

	const User = context.get("User");
	const deleteUser = buildDeleteUser({ User });

	return Object.freeze({
		deleteUser: {
			type: GraphQLBoolean,
			args: {
				uuid: {
					type: new GraphQLNonNull(GraphQLID),
				},
				clientKey: {
					type: new GraphQLNonNull(GraphQLID),
				},
			},
			resolve: async (_: any, { uuid, clientKey }: DeleteUserArguments) =>
				await deleteUser({ uuid, clientKey }),
		},
	});
}

interface DeleteUserArguments {
	uuid: string;
	clientKey: string;
}
