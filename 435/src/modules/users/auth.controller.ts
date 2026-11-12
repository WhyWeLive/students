import { Context, Hono, type TypedResponse } from "hono";
import type { UsersRepository } from "./users.repository";
import type { UserAuthenticationType, UserAuthType, UserRegisterType, UserType } from "./users.types";
import type { ApplicationEnvironment, ApplicationResult } from "../application.types";

export class AuthController {
  private readonly repository: UsersRepository;

  constructor(repository: UsersRepository) {
    this.repository = repository;
  }

  public routes(): Hono {
    return new Hono();
  }

  public async middleware(c: Context);

  public async register(
    c: Context<
      ApplicationEnvironment,
      "/register",
      { out: { json: UserRegisterType } }
    >,
  ): Promise<TypedResponse<ApplicationResult<UserAuthenticationType>>> {
    const { title, email, password } = c.req.valid("json");
    const hash = await Bun.password.hash(password);

    if (this.repository.findByEmail(email)) {
        return c.json({ success: false, error: "Account already exists" });
    }

    const user = this.repository.create({ title, email, password: hash });
  }

  public async auth(
    c: Context<
      ApplicationEnvironment,
      "/auth",
      { out: { json: UserAuthType } }
    >,
  ): Promise<TypedResponse<ApplicationResult<UserAuthenticationType>>> {
    const { email, password } = c.req.valid("json");
    const user = this.repository.findByEmail(email);

    if (!user || await Bun.password.verify(password, user.password)) {
        return c.json({ success: false, error: "Authentication failed" })
    }
  }

  public async me(
    c: Context,
  ): Promise<TypedResponse<ApplicationResult<UserType>>> {}
} // npm i -g bun
