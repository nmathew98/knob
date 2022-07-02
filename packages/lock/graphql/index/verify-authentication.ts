/*eslint @typescript-eslint/no-explicit-any: "off" */

const buildQuery = (
	uuid: string,
	clientKey: string,
	credential: Record<string, any>,
) => ({
	query: {
		verifyAuthentication: {
			__args: {
				uuid,
				clientKey,
				credential,
			},
		},
	},
});

export default buildQuery;
