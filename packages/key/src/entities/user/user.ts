export interface User {
	find: (
		identifiers: Pick<UserRecord, "uuid"> & Pick<UserRecord, "clientKey">,
	) => Promise<UserRecord | null>;
	save: (user: UserRecord) => Promise<string>;
	update: (
		identifiers: Pick<UserRecord, "uuid"> & Pick<UserRecord, "clientKey">,
		updates: Partial<UserRecord>,
	) => Promise<boolean>;
	generateSecret: (
		key?: string | void,
	) => Promise<{ secret: string; key: string }>;
	delete: (
		identifiers: Pick<UserRecord, "uuid"> & Pick<UserRecord, "clientKey">,
	) => Promise<number>;
}

export default function buildMakeUser({
	Database,
	Validator,
	Crypto,
	Uuid,
}: {
	Database: Database;
	Validator: Validator;
	Crypto: Crypto;
	Uuid: Uuid;
}) {
	Database.use();

	return function makeUser(): User {
		return Object.freeze({
			find: async identifiers => {
				const foundUser = await Database.find(identifiers);

				if (!foundUser) return null;

				const secrets = await Database.find({ store: "secrets" });

				if (!secrets) throw new Error("Secrets not available");

				const secret = secrets[foundUser.clientKey];

				if (!secret) throw new Error("Secret for client key not generated");

				return {
					uuid: foundUser.uuid,
					clientKey: foundUser.clientKey,
					challenge: foundUser.challenge,
					authenticators: foundUser.authenticators,
					secret,
				};
			},
			save: async user => {
				if (!(await Validator.isUuidValid(user.uuid, user.clientKey)))
					throw new Error("Invalid uuid");

				if (
					!user.clientKey ||
					!(await Validator.isClientKeyValid(user.clientKey))
				)
					throw new Error("Invalid client key");

				const identifiers: Partial<UserRecord> = {
					uuid: user.uuid,
					clientKey: user.clientKey,
				};

				await Database.create(identifiers, { ...user, authenticators: [] });

				return user.uuid;
			},
			update: async (identifiers, updates) => {
				if (!identifiers.uuid) throw new Error("Uuid must be specified");
				if (!identifiers.clientKey)
					throw new Error("Client key must be specified");

				if (!Object.keys(updates).length) return true;

				const sanitizedUpdates = { ...updates };
				delete sanitizedUpdates.uuid;
				delete sanitizedUpdates.clientKey;

				const result = await Database.update(identifiers, sanitizedUpdates);

				return result;
			},
			generateSecret: async key => {
				if (key)
					if (!(await Validator.isClientKeyValid(key)))
						throw new Error("Invalid client key");

				const keyToUse = key || Uuid.get();

				const secret = await Crypto.random();

				const secrets = (await Database.find({ store: "secrets" })) || {
					store: "secrets",
				};
				secrets[keyToUse] = secret;

				const clientKeys = (await Database.find({ store: "clientKeys" })) || {
					store: "clientKeys",
					keys: [],
				};
				if (!clientKeys.keys.includes(keyToUse)) clientKeys.keys.push(keyToUse);

				await Database.update({ store: "secrets" }, secrets);
				await Database.update({ store: "clientKeys" }, clientKeys);

				return { secret, key: keyToUse };
			},
			delete: async identifiers => {
				if (!identifiers.uuid) throw new Error("Uuid must be specified");
				if (!identifiers.clientKey)
					throw new Error("Client key must be specified");

				const deleteCount = await Database.delete(identifiers);

				return deleteCount;
			},
		} as User);
	};
}

export interface UserRecord {
	uuid: string;
	clientKey: string;
	authenticators?: Authenticator[];
	challenge?: string;
	secret?: string;
}

export interface Authenticator {
	credentialID: number[];
	credentialPublicKey: number[];
	counter: number;
}

export interface Database {
	use: () => Promise<any>;
	create: (
		identifiers: Record<string, any>,
		document: Record<string, any>,
	) => Promise<Record<string, any>>;
	find: (
		identifiers: Record<string, any>,
	) => Promise<Record<string, any> | null>;
	update: (
		identifiers: Record<string, any>,
		updates: Record<string, any>,
	) => Promise<Record<string, any>>;
	delete: (identifiers: Record<string, any>) => Promise<number>;
}

export interface Validator {
	isUuidValid: (uuid: string, clientKey: string) => Promise<boolean>;
	isClientKeyValid: (clientKey: string) => Promise<boolean>;
}

export interface Crypto {
	random: () => Promise<string>;
}

export interface Uuid {
	get: () => string;
}
