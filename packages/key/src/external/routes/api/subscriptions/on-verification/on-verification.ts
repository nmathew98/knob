import { DatabasePubSub } from "@adapters/database/database";
import {
	Authorization,
	doesModuleExist,
	H3,
	ServeContext,
} from "@skulpture/serve";
import { GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt } from "graphql";
import { Channel } from "queueable";

export default function onVerification(
	context: ServeContext,
	request: H3.IncomingMessage,
	response: H3.ServerResponse,
) {
	doesModuleExist(context, "Database", "Authorization");

	const Database: DatabasePubSub = context.get("Database");
	const Authorization: Pick<Authorization, "get"> =
		context.get("Authorization");

	return Object.freeze({
		onVerification: {
			type: new GraphQLNonNull(GraphQLString),
			args: {
				uuid: {
					type: new GraphQLNonNull(GraphQLID),
				},
				clientKey: {
					type: new GraphQLNonNull(GraphQLID),
				},
				expiresIn: {
					type: GraphQLInt,
				},
			},
			subscribe: async function* (
				_: any,
				{ uuid, clientKey, expiresIn }: OnVerificationArguments,
			) {
				const verificationEvents = new Channel();

				const client = await Database.subscribe("verification", message => {
					const user = JSON.parse(message);

					if (user.uuid === uuid && user.clientKey === clientKey) {
						verificationEvents.push(user);
						// Value of closing result is ignored
						verificationEvents.push(false, true);
					}
				});

				response.on("end", async () => {
					await Database.unsubscribe(client, "verification");
				});

				for await (const event of verificationEvents) {
					if (event) {
						const { uuid, secret } = event as Record<string, any>;

						const token = await Authorization.get(request, {
							sub: uuid,
							secret,
							expiresIn: expiresIn || 3.6 * Math.pow(10, 6), // Default: 1 hour
						});

						yield token;
					}
				}
			},
		},
	});
}

interface OnVerificationArguments {
	uuid: string;
	clientKey: string;
	expiresIn: number;
}
