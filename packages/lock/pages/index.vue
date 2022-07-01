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

		return (
			!!(query.authentication || query.registration) &&
			!!query.clientKey &&
			!(query.authentication && query.registration) &&
			Object.keys(query).every(key => typeof query[key] === "string")
		);
	};

	const request = useRequestHeaders();
	const route = useRoute();
	const query = route.query;
	const invalid = ref(false);
	const doesBrowserSupportWebAuthn = ref(false);
	const isMobile = ref(false);
	const errors = ref([]);
	const redirect = ref(false);

	let redirectTo: string | URL =
		request["KAS-REDIRECT-TO"] || request["kas-redirect-to"];
	try {
		redirectTo = new URL(redirectTo);
	} catch (error: any) {
		invalid.value = true;
		errors.value.push("Invalid redirect URL");
	}

	const isUserAgentMobile = () =>
		/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

	onMounted(() => {
		doesBrowserSupportWebAuthn.value = browserSupportsWebauthn();
		isMobile.value = isUserAgentMobile();

		if (process.env.NODE_ENV === "production")
			if (!isRequestValid() || !isRouteValid())
				if (window) window.location.href = "https://rickrolled.com/";
	});

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
		if (!browserSupportsWebauthn()) return;

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

					if (error.name === "InvalidStateError")
						errors.value.push("Authenticator already registered");
					else errors.value.push("Unexpected error occured");
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
					errors.value.push("Unexpected error occured");
				}
			}
		}
	};

	watch(verificationResponseResult.error, () => {
		if (verificationResponseResult.error) {
			errors.value = [
				...errors.value,
				...verificationResponseResult.error.value.graphQLErrors,
			];

			if (verificationResponseResult.error.value.networkError)
				errors.value.push(
					verificationResponseResult.error.value.networkError.message,
				);
		}
	});

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

	const authorizationToken = ref();
	const verified = ref();
	/**
	 * This is a one off subscription maybe it's better to
	 * just use Wonka streams and the client directly
	 */
	useSubscription(
		{
			query: onVerificationQuery,
		},
		(_, response) => {
			if (!authorizationToken.value) {
				if (response.onVerification === "unverified") {
					verified.value = false;
					errors.value.push("Authentication failed");
				} else {
					verified.value = true;

					if (response.onVerification !== "verified") {
						authorizationToken.value = response.onVerification;
						redirect.value = true;
					}
				}
			}
		},
	);

	onMounted(() => {
		watch(redirect, () => {
			if (redirect.value)
				setTimeout(() => {
					const searchParams = new URLSearchParams();
					if (authorizationToken.value)
						searchParams.append("authorization", authorizationToken.value);

					let redirectUri = (redirectTo as URL).href;
					if (authorizationToken.value)
						redirectUri = `${redirectUri}?${searchParams.toString()}`;

					window.location.href = redirectUri;
				}, 5000);
		});
	});
</script>

<template>
	<NuxtLayout name="default">
		<div class="flex flex-col gap-y-10 items-center px-6">
			<div class="text-base md:text-lg font-semibold max-w-xl text-center">
				<h1 v-if="!isMobile">
					Scan the QR code below on your mobile device to authenticate with your
					phone
				</h1>
				<h1 v-if="doesBrowserSupportWebAuthn && isMobile">
					Tap the QR code to begin authentication
				</h1>
				<h1 v-if="!doesBrowserSupportWebAuthn && isMobile">
					Unsupported browser
				</h1>
			</div>

			<QrCode
				:value="`${`${qrCodeUri}?${searchParams.toString()}`}`"
				@click="authenticateUser"
				class="cursor-pointer"></QrCode>

			<h3
				v-if="doesBrowserSupportWebAuthn && !isMobile"
				class="text-sm md:text-md font-light max-w-xl text-center uppercase -mt-10">
				or insert a security key on your computer and click the QR code
			</h3>

			<div class="flex flex-col">
				<template v-if="invalid" v-for="error in errors" :key="error">
					<span class="text-base max-w-xl uppercase text-red-500">
						{{ error }}
					</span>
				</template>
			</div>
		</div>
	</NuxtLayout>
</template>
