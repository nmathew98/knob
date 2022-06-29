<script setup lang="ts">
	import { createClient as createWSClient } from "graphql-sse";
	import {
		createClient,
		provideClient,
		defaultExchanges,
		subscriptionExchange,
	} from "@urql/vue";

	const sseClient = createWSClient({
		url: `${useBackend()}/api/subscriptions`,
	});

	const client = createClient({
		url: `${useBackend()}/api`,
		exchanges: [
			...defaultExchanges,
			subscriptionExchange({
				forwardSubscription(operation) {
					return {
						subscribe: sink => {
							const dispose = sseClient.subscribe(operation, sink);

							return {
								unsubscribe: dispose,
							};
						},
					};
				},
			}),
		],
	});

	provideClient(client);
</script>

<template>
	<NuxtPage />
</template>
