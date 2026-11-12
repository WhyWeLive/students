import { Database } from "bun:sqlite";
import { UsersRepository } from "./users.repository";
import { UsersController } from "./users.controller";
import { Hono } from "hono";

export class UsersModule {
  private readonly controller: UsersController;
  private readonly repository: UsersRepository;

  constructor(database: Database) {
    this.repository = new UsersRepository(database);
    this.controller = new UsersController(this.repository);
  }

  public init(): Hono {
    this.repository.init();

    return this.controller.routes();
  }
}
