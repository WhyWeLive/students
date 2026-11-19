import { Hono } from "hono";
import { Database } from "bun:sqlite";
import { UsersModule } from "./users/users.module";

export class ApplicationModule {
  private readonly server: Hono; // CHANGED
  private readonly database: Database;
  private readonly users: UsersModule;

  constructor() {
    this.server = new Hono(); // CHANGED
    this.database = new Database("api.sqlite");
    this.users = new UsersModule(this.database);
  }

  public init(): ApplicationModule {
    this.users.init();

    return this;
  }
  // CHANGED
  public start(): Hono {
    return this.server;
  }
}
