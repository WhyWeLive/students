import {afterEach, beforeAll, beforeEach, describe, expect, test} from "bun:test";
import {Database} from "bun:sqlite";
import {Hono} from "hono";
import {sign} from "hono/jwt";
import z from "zod";
import {createTestClient} from "../../testing/test-client";
import type {ApplicationEnviroment} from "../application.types";
import {UsersModule} from "./users.module";
import {userSchema} from "./users.types";

const bindings = {JWT_SECRET: "test-secret-for-users-only"};
const responseUserSchema = userSchema.strict();
const userResponseSchema = z.strictObject({
  success: z.literal(true),
  data: responseUserSchema,
});
const usersResponseSchema = z.strictObject({
  success: z.literal(true),
  data: z.array(responseUserSchema),
});
const errorResponseSchema = z.strictObject({
  success: z.literal(false),
  error: z.string().min(1),
});

describe("Пользователи", () => {
  let database: Database;
  let app: Hono<ApplicationEnviroment>;
  let client: ReturnType<typeof createTestClient>;
  let token: string;
  let passwordHash: string;
  let previousSecret: string | undefined;

  beforeAll(async () => {
    passwordHash = await Bun.password.hash("test-password");
  });

  beforeEach(async () => {
    previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = bindings.JWT_SECRET;
    database = new Database(":memory:");
    const {authRouter, usersRouter, validate} = new UsersModule(database).init();

    app = new Hono<ApplicationEnviroment>();
    app.use("*", validate);
    app.route("/api/auth", authRouter);
    app.route("/api/users", usersRouter);
    client = createTestClient(app, bindings);

    const insert = database.query(
      "INSERT INTO users (id, title, email, password) VALUES (?, ?, ?, ?)",
    );
    insert.run(1, "Student One", "one@example.com", passwordHash);
    insert.run(2, "Student Two", "two@example.com", passwordHash);
    token = await sign({sub: "1"}, bindings.JWT_SECRET, "HS256");
  });

  afterEach(() => {
    database.close();
    if (previousSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousSecret;
    }
  });

  describe.each(["/api/users", "/api/users/2"])("доступ к %s", (path) => {
    test("без токена возвращает 401", async () => {
      const response = await client.get(path);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({success: false, error: "BAD AUTH"});
    });

    test("некорректный токен возвращает 401", async () => {
      const response = await client.get(path, "invalid-token");

      expect(response.status).toBe(401);
      errorResponseSchema.parse(await response.json());
    });

    test("неверная схема авторизации возвращает 401", async () => {
      const response = await app.request(path, {
        headers: {Authorization: `Basic ${token}`},
      }, bindings);

      expect(response.status).toBe(401);
      errorResponseSchema.parse(await response.json());
    });

    test("поддельная подпись возвращает 401", async () => {
      const forgedToken = await sign({sub: "1"}, "another-secret", "HS256");
      const response = await client.get(path, forgedToken);

      expect(response.status).toBe(401);
      errorResponseSchema.parse(await response.json());
    });

    test("просроченный токен возвращает 401", async () => {
      const expiredToken = await sign({
        sub: "1",
        exp: Math.floor(Date.now() / 1000) - 60,
      }, bindings.JWT_SECRET, "HS256");
      const response = await client.get(path, expiredToken);

      expect(response.status).toBe(401);
      errorResponseSchema.parse(await response.json());
    });

    test("токен удалённого пользователя возвращает 401", async () => {
      database.run("DELETE FROM users WHERE id = 1");
      const response = await client.get(path, token);

      expect(response.status).toBe(401);
      errorResponseSchema.parse(await response.json());
    });
  });

  test("список возвращает пользователей по схеме API", async () => {
    const response = await client.get("/api/users", token);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    const {data} = usersResponseSchema.parse(await response.json());
    expect(data).toHaveLength(2);
    expect(data).toEqual(expect.arrayContaining([
      {id: 1, title: "Student One", email: "one@example.com", password: passwordHash},
      {id: 2, title: "Student Two", email: "two@example.com", password: passwordHash},
    ]));
  });

  test("пустой список возвращает массив, а не null", async () => {
    // Отдельно проверяем контроллер: с пустой таблицей пройти авторизацию нельзя.
    app = new Hono<ApplicationEnviroment>();
    const {usersRouter} = new UsersModule(database).init();
    app.route("/api/users", usersRouter);
    database.run("DELETE FROM users");

    const response = await createTestClient(app, bindings).get("/api/users", token);

    expect(response.status).toBe(200);
    expect(usersResponseSchema.parse(await response.json())).toEqual({success: true, data: []});
  });

  test("по id возвращает именно запрошенного пользователя", async () => {
    const response = await client.get("/api/users/2", token);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    expect(userResponseSchema.parse(await response.json())).toEqual({
      success: true,
      data: {id: 2, title: "Student Two", email: "two@example.com", password: passwordHash},
    });
  });

  test.each(["0", "999"])("несуществующий id %s возвращает 404", async (id) => {
    const response = await client.get(`/api/users/${id}`, token);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({success: false, error: "User not found"});
  });

  test.each(["abc", "-1", "1.5", "1abc", "1e2", "%20", "1%20OR%201=1"])(
    "некорректный id %s возвращает 400",
    async (id) => {
      const response = await client.get(`/api/users/${id}`, token);

      expect(response.status).toBe(400);
      errorResponseSchema.parse(await response.json());
    },
  );

  test("авторизация проверяется до входных данных", async () => {
    const response = await client.get("/api/users/invalid");

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({success: false, error: "BAD AUTH"});
  });
});
