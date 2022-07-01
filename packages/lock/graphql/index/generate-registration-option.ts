const buildQuery = (uuid: string, clientKey: string) => ({
	mutation: {
		generateRegistrationOption: {
			__args: {
				uuid,
				clientKey,
			},
			challenge: true,
			allowCredentials: {
				id: true,
				transports: true,
			},
			timeout: true,
			userVerification: true,
			extensions: {
				appid: true,
				appidExclude: true,
				credProps: true,
				uvm: true,
			},
		},
	},
});

export default buildQuery;
