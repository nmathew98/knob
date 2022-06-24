import { DatabasePubSub } from "@adapters/database/database";
import { doesModuleExist, H3, ServeContext } from "@skulpture/serve";
import { GraphQLBoolean, GraphQLNonNull, GraphQLID } from "graphql";
import { Channel } from "queueable";

export default function onVerification(
	context: ServeContext,
	_: H3.IncomingMessage,
	response: H3.ServerResponse,
) {
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
			subscribe: async function* (
				_: any,
				{ uuid, clientKey }: OnVerificationArguments,
			) {
				const verificationEvents = new Channel();

				const client = await Database.subscribe("verification", message => {
					const user = JSON.parse(message);

					if (user.uuid === uuid && user.clientKey === clientKey)
						verificationEvents.push(user.verified);
				});

				response.on("end", async () => {
					verificationEvents.push(false, true);
					await Database.unsubscribe(client, "verification");
				});

				for await (const event of verificationEvents) yield event;
			},
		},
	});
}

interface OnVerificationArguments {
	uuid: string;
	clientKey: string;
}
