const buildQuery = (uuid: string, clientKey: string, expiresIn?: number) => ({
	subscription: {
		onVerification: {
			__args: {
				uuid,
				clientKey,
				expiresIn: !expiresIn ? null : expiresIn,
			},
		},
	},
});

export default buildQuery;
