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

	const route = useRoute();
	const query = route.query;
	const invalid = ref(false);

	if (
		(!query.authentication && !query.registration) ||
		(query.authentication && query.registration) ||
		!query.clientKey
	)
		invalid.value = true;

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

	const onVerification = useSubscription({
		query: onVerificationQuery,
	});
	const verificationOption = useMutation(generateOptionQuery);
</script>

<template>
	<NuxtLayout name="default">
		<div v-if="!invalid" class="flex flex-col gap-y-10 items-center px-6">
			<h1 class="text-base md:text-lg font-semibold max-w-md text-center">
				Scan the QR code below on your mobile device to authenticate with your
				phone
			</h1>
			<QrCode value="hello world"></QrCode>
			<h3
				class="text-sm md:text-md font-light max-w-md text-center uppercase -mt-10">
				or insert a security key on your computer
			</h3>
		</div>
	</NuxtLayout>
</template>
