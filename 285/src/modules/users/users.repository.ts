import { Database } from "bun:sqlite";

export class UsersRepository {
  constructor(private readonly database: Database) {}

  public init(): void {}
}
