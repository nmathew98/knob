<script setup lang="ts">
	import QRCode from "qrcode";

	const props = defineProps({
		value: {
			type: String,
			required: true,
		},
	});

	const {
		value: { value },
	} = toRefs(props);
	const errorMessage = ref("");
	const generatedCode = ref("");

	onMounted(async () => {
		try {
			generatedCode.value = await QRCode.toDataURL(value);
		} catch (error: any) {
			errorMessage.value = error.message;
		}
	});
</script>

<template>
	<div class="py-10 flex flex-col items-center">
		<img class="w-48 h-48 rounded-lg shadow-md" :src="generatedCode" />
		<span class="text-red-500 bold uppercase mt-8">{{ errorMessage }}</span>
	</div>
</template>
