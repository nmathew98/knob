import { Crypto as UserCrypto } from "@entities/user/user";
import { randomBytes } from "crypto";

const Crypto: UserCrypto = {
	random: async () => {
		return randomBytes(64).toString("hex");
	},
};

export default Crypto;
