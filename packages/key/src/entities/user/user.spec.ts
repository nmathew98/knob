import buildMakeUser, { Database, Validator } from "./user";

describe("User", () => {
	let Database: Database;
	let Validator: Validator;
	let makeUser: any;

	beforeEach(() => {
		const clientKeys = ["123123", "234234", "345345"];
		const users = [
			{ uuid: "123123", clientKey: "123123" },
			{ uuid: "234234", clientKey: "234234" },
		];

		Database = {
			use: jest.fn(),
			create: jest.fn().mockImplementation(user => {
				users.push(user);
			}),
			find: jest
				.fn()
				.mockImplementation(identifiers =>
					users
						.filter(
							user =>
								user.uuid === identifiers.uuid &&
								user.clientKey === identifiers.clientKey,
						)
						.pop(),
				),
			update: jest.fn(),
			delete: jest.fn().mockImplementation(() => 1),
		};

		Validator = {
			isUuidValid: jest
				.fn()
				.mockImplementation(
					(uuid, clientKey) =>
						!users.some(
							(user: any) => user.uuid === uuid && user.clientKey === clientKey,
						),
				),
			isClientKeyValid: jest
				.fn()
				.mockImplementation(clientKey => clientKeys.includes(clientKey)),
		};

		makeUser = buildMakeUser({ Database, Validator });
	});

	describe("makeUser", () => {
		it("instantiates the redis client", async () => {
			expect(Database.use).toBeCalledTimes(1);
		});
	});

	describe("find", () => {
		it("returns null if there are no matching users", async () => {
			const user = makeUser();

			const result = await user.find({});

			expect(Database.find).toBeCalledTimes(1);
			expect(result).toStrictEqual(null);
		});

		it("returns a matching user", async () => {
			const user = makeUser();

			const result = await user.find({ uuid: "123123", clientKey: "123123" });

			expect(Database.find).toBeCalledTimes(1);
			expect(!!result).toStrictEqual(true);
			expect(!Array.isArray(result)).toStrictEqual(true);
		});
	});

	describe("save", () => {
		it("throws an error if uuid is not valid", async () => {
			const user = makeUser();

			try {
				await user.save({ uuid: "234234", clientKey: "234234" });
			} catch (error: any) {
				expect(error.message).toStrictEqual("Invalid uuid");
				expect(Database.create).toBeCalledTimes(0);
				expect(Validator.isUuidValid).toBeCalledTimes(1);
			}
		});

		it("throws an error if client key is not valid", async () => {
			const user = makeUser();

			try {
				await user.save({ uuid: "234234", clientKey: "567567" });
			} catch (error: any) {
				expect(error.message).toStrictEqual("Invalid client key");
				expect(Database.create).toBeCalledTimes(0);
				expect(Validator.isUuidValid).toBeCalledTimes(1);
			}
		});

		it("creates a user record if fields are valid", async () => {
			const user = makeUser();

			const result = await user.save({
				uuid: "345345",
				clientKey: "345345",
			});

			expect(result).toStrictEqual("345345");
			expect(Database.create).toBeCalledTimes(1);
			expect(Validator.isUuidValid).toBeCalledTimes(1);
			expect(Validator.isClientKeyValid).toBeCalledTimes(1);
		});
	});

	describe("update", () => {
		it("throws an error if uuid is not specified", async () => {
			const user = makeUser();

			try {
				await user.update({ clientKey: "567567" }, {});
			} catch (error: any) {
				expect(error.message).toStrictEqual("Uuid must be specified");
				expect(Database.update).toBeCalledTimes(0);
			}
		});

		it("throws an error if clientKey is not specified", async () => {
			const user = makeUser();

			try {
				await user.update({ uuid: "567567" }, {});
			} catch (error: any) {
				expect(error.message).toStrictEqual("Client key must be specified");
				expect(Database.update).toBeCalledTimes(0);
			}
		});

		it("does not update if there are no fields to update", async () => {
			const user = makeUser();

			const result = await user.update(
				{ uuid: "234234", clientKey: "234234" },
				{},
			);

			expect(Database.update).toBeCalledTimes(0);
			expect(result).toStrictEqual(true);
		});

		it("updates a user if fields are valid", async () => {
			const user = makeUser();

			const result = await user.update(
				{ uuid: "234234", clientKey: "234234" },
				{ challenge: "abcdef" },
			);

			expect(Database.update).toBeCalledTimes(1);
			expect(result).toStrictEqual(true);
		});
	});

	describe("delete", () => {
		it("throws an error if uuid is not specified", async () => {
			const user = makeUser();

			try {
				await user.delete({ clientKey: "567567" });
			} catch (error: any) {
				expect(error.message).toStrictEqual("Uuid must be specified");
				expect(Database.delete).toBeCalledTimes(0);
			}
		});

		it("throws an error if clientKey is not specified", async () => {
			const user = makeUser();

			try {
				await user.delete({ uuid: "567567" });
			} catch (error: any) {
				expect(error.message).toStrictEqual("Client key must be specified");
				expect(Database.delete).toBeCalledTimes(0);
			}
		});

		it("returns the number of records deleted", async () => {
			const user = makeUser();

			const result = await user.delete({ uuid: "234234", clientKey: "234234" });

			expect(result).toStrictEqual(1);
			expect(Database.delete).toBeCalledTimes(1);
		});
	});
});
