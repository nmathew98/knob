import { Validator as UserValidator } from "@entities/user/user";
import Database from "@adapters/database/database";
import ClientKeyValidator from "uuid-validate";

const Validator: UserValidator = {
	isUuidValid: async (uuid, clientKey) => {
		const foundUser = await Database.find({ uuid, clientKey });

		return !foundUser;
	},
	isClientKeyValid: async clientKey => {
		const clientKeys = await Database.find({ store: "clientKeys" });

		if (!clientKeys) return true;

		if (
			(clientKeys.keys.includes(clientKey) && ClientKeyValidator(clientKey)) ||
			clientKey === null ||
			clientKey === undefined
		)
			return true;

		return false;
	},
};

export default Validator;
