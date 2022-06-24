import { Validator as UserValidator } from "@entities/user/user";
import Database from "@adapters/database/database";

const Validator: UserValidator = {
	isUuidValid: async (uuid, clientKey) => {
		const foundUser = await Database.find({ uuid, clientKey });

		return !foundUser;
	},
};

export default Validator;
