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
	const Authorization: Authorization = context.get("Authorization");

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
				const isAuthorized = await Authorization.verify(request, { clientKey });
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
						const { uuid, secret, verified } = event as Record<string, any>;

						if (!verified)
							yield "unverified";

						const token = await Authorization.get(request, {
							sub: uuid,
							secret,
							expiresIn: expiresIn || 3.6 * Math.pow(10, 6), // Default: 1 hour
						});

						/**
						 * If the request is authorized appropriately we return a token
						 *
						 * If the request is not authorized we only send back their verification
						 * status to indicate if the user is verified or not so that
						 * any updates to the UI can happen
						 */
						if (isAuthorized) {
							// Add authorization cookie and token on verification
							response.setHeader("Authorization", `Bearer ${token as string}`);
							H3.setCookie(response.event, "authorization", token as string);

							// Remove KAS authorization
							response.setHeader("KAS-AUTHORIZATION", "");
							response.setHeader("kas-authorization", "");
							H3.setCookie(response.event, "kas-authorization", "");

							yield token;
						} else yield "verified";
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
