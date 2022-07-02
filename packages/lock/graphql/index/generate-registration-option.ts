const buildQuery = (uuid: string, clientKey: string) => ({
	mutation: {
		generateRegistrationOption: {
			__args: {
				uuid,
				clientKey,
			},
		},
	},
});

export default buildQuery;
