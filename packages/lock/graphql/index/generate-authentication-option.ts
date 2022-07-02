const buildQuery = (uuid: string, clientKey: string) => ({
	mutation: {
		generateAuthenticationOption: {
			__args: {
				uuid,
				clientKey,
			},
		},
	},
});

export default buildQuery;
