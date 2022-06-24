import { DatabasePubSub } from "@adapters/database/database";
import { doesModuleExist, ServeContext } from "@skulpture/serve";
import { GraphQLBoolean, GraphQLNonNull, GraphQLID } from "graphql";

export default function onVerification(context: ServeContext) {
	doesModuleExist(context, "Database");

	const Database: DatabasePubSub = context.get("Database");

	return Object.freeze({
		onVerification: {
			type: GraphQLBoolean,
			args: {
				uuid: {
					type: new GraphQLNonNull(GraphQLID),
				},
				clientKey: {
					type: new GraphQLNonNull(GraphQLID),
				},
			},
			subscribe: async (
				_: any,
				{ uuid, clientKey }: OnVerificationArguments,
			) => {
				const verificationStatus = new Promise(
					(resolve: (value: boolean | null) => void) => {
						Database.subscribe("verification", message => {
							const user = JSON.parse(message);

							if (user.uuid === uuid && user.clientKey === clientKey)
								return resolve(user.verified as boolean);

							return resolve(null);
						});
					},
				);

				return await verificationStatus;
			},
		},
	});
}

interface OnVerificationArguments {
	uuid: string;
	clientKey: string;
}
