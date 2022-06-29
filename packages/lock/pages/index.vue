<script setup lang="ts">
	import buildGenerateRegistrationOptionQuery from "~~/graphql/index/generate-authentication-option";
	import buildGenerateAuthenticationOptionQuery from "~~/graphql/index/generate-authentication-option";
	import buildOnVerificationQuery from "~~/graphql/index/on-verification";
	import buildVerifyAuthenticationQuery, {
		AuthenticationCredentialJSON,
	} from "~~/graphql/index/verify-authentication";
	import buildVerifyRegistrationQuery, {
		RegistrationCredentialJSON,
	} from "~~/graphql/index/verify-registration";
	import { useQuery, useMutation, useSubscription } from "@urql/vue";
	import {
		startAuthentication,
		startRegistration,
		browserSupportsWebauthn,
	} from "@simplewebauthn/browser";
	import { Ref } from "vue";

	const isRequestValid = () => {
		const request = useRequestHeaders();

		return !!(request["KAS-REDIRECT-TO"] || request["kas-redirect-to"]);
	};

	const isRouteValid = () => {
		const route = useRoute();
		const { query } = route;

		return !!(query.authentication || query.registration) && !!query.clientKey;
	};

	onMounted(() => {
		if (process.env.NODE_ENV === "production")
			if (!isRequestValid() || !isRouteValid())
				window.location.href = "https://rickrolled.com/";
	});

	const request = useRequestHeaders();
	const route = useRoute();
	const query = route.query;
	const invalid = ref(false);

	if (!browserSupportsWebauthn()) invalid.value = true;

	let redirectTo: string | URL =
		request["KAS-REDIRECT-TO"] || request["kas-redirect-to"];
	try {
		redirectTo = new URL(redirectTo);
	} catch (error: any) {
		invalid.value = true;
	}

	for (const key in query)
		if (typeof query[key] !== "string") invalid.value = true;

	let onVerificationQuery: string;
	let generateOptionQuery: string;
	let verificationQuery: (
		credential: AuthenticationCredentialJSON | RegistrationCredentialJSON,
	) => string;
	{
		onVerificationQuery = createQuery(
			buildOnVerificationQuery(
				(query.authentication as string) || (query.registration as string),
				query.clientKey as string,
			),
		);

		if (query.authentication)
			generateOptionQuery = createQuery(
				buildGenerateAuthenticationOptionQuery(
					query.authentication as string,
					query.clientKey as string,
				),
			);
		else
			generateOptionQuery = createQuery(
				buildGenerateRegistrationOptionQuery(
					query.registration as string,
					query.clientKey as string,
				),
			);

		if (query.authentication)
			verificationQuery = (credential: AuthenticationCredentialJSON) =>
				createQuery(
					buildVerifyAuthenticationQuery(
						query.authentication as string,
						query.clientKey as string,
						credential,
					),
				);
		else
			verificationQuery = (credential: RegistrationCredentialJSON) =>
				createQuery(
					buildVerifyRegistrationQuery(
						query.authentication as string,
						query.clientKey as string,
						credential,
					),
				);
	}

	const verificationOptionMutation = useMutation(generateOptionQuery);
	const authorizationResponse: Ref<Record<string, any>> = ref();
	const verificationResponseResult = useQuery({
		query: verificationQuery(
			authorizationResponse.value as
				| AuthenticationCredentialJSON
				| RegistrationCredentialJSON,
		),
		pause: computed(() => !authorizationResponse.value),
	});

	const authenticateUser = async () => {
		if (query.registration) {
			await verificationOptionMutation.executeMutation(null);

			if (verificationOptionMutation.data) {
				try {
					authorizationResponse.value = await startRegistration(
						verificationOptionMutation.data.value,
					);

					await verificationResponseResult;
				} catch (error: any) {
					invalid.value = true;

					if (error.name === "InvalidStateError") {
						// Authenticator already registered
					}
				}
			}
		}

		if (query.authentication) {
			await verificationOptionMutation.executeMutation(null);

			if (verificationOptionMutation.data) {
				try {
					authorizationResponse.value = await startAuthentication(
						verificationOptionMutation.data.value,
					);

					await verificationResponseResult;
				} catch (error: any) {
					invalid.value = true;
				}
			}
		}
	};

	onMounted(() => {
		document.addEventListener("keydown", async event => {
			switch (event.key) {
				case "Enter":
					await authenticateUser();
					break;
				default:
					break;
			}
		});
	});

	const qrCodeUri = useFrontend();
	const searchParams = new URLSearchParams();

	if (query.authentication)
		searchParams.append("authentication", `${query.authentication}`);
	else searchParams.append("registration", `${query.registration}`);
	searchParams.append("clientKey", `${query.clientKey}`);
	searchParams.append("redirect", "false");

	const authorizationToken = ref("");
	/**
	 * This is a one off subscription maybe it's better to
	 * just use Wonka streams and the client directly
	 */
	useSubscription(
		{
			query: onVerificationQuery,
		},
		(_, response) => {
			if (!authorizationToken.value)
				authorizationToken.value = response.onVerification;
		},
	);
</script>

<template>
	<NuxtLayout name="default">
		<div v-if="!invalid" class="flex flex-col gap-y-10 items-center px-6">
			<h1 class="text-base md:text-lg font-semibold max-w-md text-center">
				Scan the QR code below on your mobile device to authenticate with your
				phone
			</h1>
			<QrCode :value="`${`${qrCodeUri}?${searchParams.toString()}`}`"></QrCode>
			<h3
				class="text-sm md:text-md font-light max-w-md text-center uppercase -mt-10">
				or insert a security key on your computer
			</h3>
		</div>
	</NuxtLayout>
</template>
