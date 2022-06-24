import { Validator as UserValidator } from "@entities/user/user";
import Database from "@adapters/database/database";

const Validator: UserValidator = {
	isUuidValid: async (uuid, clientKey) => {
		const foundUser = await Database.find({ uuid, clientKey });

		return !foundUser;
	},
	isClientKeyValid: async clientKey => {
		const clientKeys = await Database.find({ store: "clientKey" });

		if (!clientKeys) return true;

		if (clientKeys.keys.includes(clientKey)) return true;

		return false;
	},
};

export default Validator;
