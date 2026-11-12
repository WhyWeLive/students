import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { UsersRepository } from "./users.repository";
import { UsersController } from "./users.controller";

export class UsersModule {
  private readonly repository: UsersRepository;
  private readonly controller: UsersController;

  constructor(private readonly database: Database) {
    this.repository = new UsersRepository(this.database);
    this.controller = new UsersController(this.repository);
  }

  public init(): void {
    this.repository.init();
  }

  public routes(): Hono {
    return this.controller.routes();
  }
}
