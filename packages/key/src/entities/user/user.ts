export interface User {
	find: (
		identifiers: Pick<UserRecord, "uuid"> & Pick<UserRecord, "clientKey">,
	) => Promise<UserRecord | null>;
	save: (user: UserRecord) => Promise<string>;
	update: (
		identifiers: Pick<UserRecord, "uuid"> & Pick<UserRecord, "clientKey">,
		updates: Partial<UserRecord>,
	) => Promise<boolean>;
	delete: (
		identifiers: Pick<UserRecord, "uuid"> & Pick<UserRecord, "clientKey">,
	) => Promise<number>;
}

export default function buildMakeUser({
	Database,
	Validator,
}: {
	Database: Database;
	Validator: Validator;
}) {
	Database.use();

	return function makeUser(): User {
		return Object.freeze({
			find: async identifiers => {
				const foundUser = await Database.find(identifiers);

				if (!foundUser) return null;

				return {
					uuid: foundUser.uuid,
					clientKey: foundUser.clientKey,
					challenge: foundUser.challenge,
					authenticators: foundUser.authenticators,
				};
			},
			save: async user => {
				if (!(await Validator.isUuidValid(user.uuid, user.clientKey)))
					throw new Error("Invalid uuid");

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

				await Database.update(identifiers, updates);

				return true;
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
}
