import {afterEach, beforeEach, describe, expect, test} from "bun:test";
import {Database} from "bun:sqlite";
import {Hono} from "hono";
import {sign} from "hono/jwt";
import z from "zod";
import type {ApplicationEnviroment} from "../application.types";
import {UsersModule} from "./users.module";
import {userSchema, userTokenSchema} from "./users.types";
import {createTestClient} from "../../testing/test-client";

const tokenResponseSchema = z.object({
  success: z.literal(true),
  data: userTokenSchema
});
const profileResponseSchema = z.object({
  success: z.literal(true),
  data: userSchema
});

const bindings = {JWT_SECRET: "test-secret-for-authentication-only"};
const account = {
  title: "Student",
  email: "student@example.com",
  password: "test-password",
};

describe("Авторизация", () => {
  let database: Database;
  let app: Hono<ApplicationEnviroment>;
  let client: ReturnType<typeof createTestClient>;

  beforeEach(() => {
    database = new Database(":memory:");

    const {authRouter, validate} = new UsersModule(database).init();

    app = new Hono<ApplicationEnviroment>();
    app.use("*", validate);
    app.route("/api/auth", authRouter);

    client = createTestClient(app, bindings);
  });

  afterEach(() => database.close());

  test("регистрация возвращает токен", async () => {
    const response = await client.post("/api/auth/register", account);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: {token: expect.any(String)},
    });
  });

  test("повторная регистрация возвращает 409", async () => {
    await client.post("/api/auth/register", account);

    const response = await client.post("/api/auth/register", account);

    expect(response.status).toBe(409);
  });

  test("вход с правильным паролем возвращает рабочий токен", async () => {
    await client.post("/api/auth/register", account);

    const response = await client.post("/api/auth/auth", {
      email: account.email,
      password: account.password,
    });
    const result = tokenResponseSchema.parse(await response.json());

    expect(response.status).toBe(200);
    expect(result.data.token).toEqual(expect.any(String));

    const profile = await client.me(result.data.token);
    expect(profile.status).toBe(200);
    expect(await profile.json()).toMatchObject({
      success: true,
      data: {
        id: expect.any(Number),
        title: account.title,
        email: account.email
      },
    });
  });

  test("неверный пароль возвращает 401", async () => {
    await client.post("/api/auth/register", account);

    const response = await client.post("/api/auth/auth", {
      email: account.email,
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
  });

  test("без токена возвращает 401", async () => {
    expect((await client.me()).status).toBe(401);
  });

  test("поддельная подпись возвращает 401", async () => {
    const registration = await client.post("/api/auth/register", account);
    const {data} = tokenResponseSchema.parse(await registration.json());
    const profile = await client.me(data.token);
    const {data: user} = profileResponseSchema.parse(await profile.json());
    const token = await sign({sub: String(user.id)}, "another-test-secret", "HS256");

    expect((await client.me(token)).status).toBe(401);
  });

  test("просроченный токен возвращает 401", async () => {
    const registration = await client.post("/api/auth/register", account);
    const {data} = tokenResponseSchema.parse(await registration.json());
    const profile = await client.me(data.token);
    const {data: user} = profileResponseSchema.parse(await profile.json());
    const token = await sign({
      sub: String(user.id),
      exp: Math.floor(Date.now() / 1000) - 60,
    }, bindings.JWT_SECRET, "HS256");

    expect((await client.me(token)).status).toBe(401);
  });

  test("некорректный токен возвращает 401", async () => {
    expect((await client.me("invalid-token")).status).toBe(401);
  });
});
