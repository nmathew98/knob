const buildQuery = (uuid: string, clientKey: string) => ({
	mutation: {
		generateAuthenticationOption: {
			__args: {
				uuid,
				clientKey,
			},
			challenge: true,
			allowCredentials: {
				id: true,
				transports: true,
			},
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
