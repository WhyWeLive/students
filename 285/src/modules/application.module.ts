import { Hono } from "hono";
import { Database } from "bun:sqlite";
import { UsersModule } from "./users/users.module";

export class ApplicationModule {
  private readonly database: Database;
  private readonly users: UsersModule;

  constructor() {
    this.database = new Database("api.sqlite");

    this.users = new UsersModule(this.database);
  }

  public init(): ApplicationModule {
    this.users.init();

    return this;
  }

  public server(): Hono {
    const usersRouter = this.users.routes();

    return new Hono()
      .route('/api/users', usersRouter);
  }
}
