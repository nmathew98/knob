const buildQuery = (uuid: string, clientKey: string) => ({
	mutation: {
		generateRegistrationOption: {
			__args: {
				uuid,
				clientKey,
			},
			user: {
				id: true,
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
