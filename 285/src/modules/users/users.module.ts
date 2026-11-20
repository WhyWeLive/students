import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { UsersRepository } from "./users.repository";
import { UsersController } from "./users.controller";
import { AuthController } from "./auth.controller";

export class UsersModule {
  private readonly repository: UsersRepository;

  private readonly users: UsersController;
  private readonly auth: AuthController;

  constructor(private readonly database: Database) {
    this.repository = new UsersRepository(this.database);

    this.users = new UsersController(this.repository);
    this.auth = new AuthController(this.repository);
  }

  public init() {
    this.repository.init();

    return {
      authRouter: this.auth.routes(),
      usersRouter: this.users.routes(),

      validate: this.auth.validate.bind(this.auth),
    }
  }
}
