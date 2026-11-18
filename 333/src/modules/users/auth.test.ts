import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { Database } from 'bun:sqlite';
import { Hono } from 'hono';
import type { ApplicationEnviroment } from '../application.types';
import { createTestClient } from '../../testing/test-client';
import { UsersModule } from './users.module';

const bindings = { JWT_SECRET: "test-jwt-secret" };

describe("Авторизация", () => {
	let database: Database;
	let app: Hono<ApplicationEnviroment>;
	let client: ReturnType<typeof createTestClient>;

	beforeEach(() => {
		database = new Database(":memory:");

		const { authRouter, validate } = new UsersModule(database).init();

		app = new Hono<ApplicationEnviroment>();
		app.use("*", validate);
		app.route("/api/auth", authRouter);

		client = createTestClient(app, bindings);
	});

	afterEach(() => database.close());

	test("регистарция возвращает код 200", async () => {
		const response = await client.post("/api/auth/register", {
			title: "TEST-USER-01",
			email: "test-user-01@nke.ru",
			password: "12345678",
		});

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			success: true,
			data: {
				token: expect.any(String),
			},
		});
	});
});
