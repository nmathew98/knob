<script setup lang="ts">
	import buildGenerateRegistrationOptionQuery from "~~/graphql/index/generate-authentication-option";
	import buildGenerateAuthenticationOptionQuery from "~~/graphql/index/generate-authentication-option";
	import buildOnVerificationQuery from "~~/graphql/index/on-verification";
	import buildVerifyAuthenticationQuery from "~~/graphql/index/verify-authentication";
	import buildVerifyRegistrationQuery from "~~/graphql/index/verify-registration";
</script>

<template>
	<NuxtLayout name="default">
		<div class="flex flex-col gap-y-10 items-center px-6">
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
