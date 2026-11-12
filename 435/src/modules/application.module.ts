import { Database } from "bun:sqlite";
import { UsersModule } from "./users/users.module";
import { Hono } from "hono";

export class ApplicationModule {
  private readonly hono: Hono;
  private readonly database: Database;
  private readonly users: UsersModule;

  constructor() {
    this.hono = new Hono();
    this.database = new Database("platform.sqlite");
    this.users = new UsersModule(this.database);
  }

  public init(): ApplicationModule {
    const { authRouter, usersRouter, authMiddleware } = this.users.init();

    this.hono.use("*", authMiddleware);

    this.hono.route("/api/auth", authRouter);
    this.hono.route("/api/users", usersRouter);
    
    return this;
  }
  

  public start(): Hono {
    return this.hono;
  }
}
