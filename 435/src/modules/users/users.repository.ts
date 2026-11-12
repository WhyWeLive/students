import { Database } from "bun:sqlite";
import type { UserType, UserRegisterType } from "./users.types";

export class UsersRepository {
  private readonly database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  public init(): void {
    this.database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        email TEXT NOT NULL
      )
    `);
  }

  public findAll(): UserType[] {
    return this.database.query<UserType, []>("SELECT * FROM users").all();
  }

  public findById(id: number): UserType | null {
    return this.database
      .query<UserType, [number]>("SELECT * FROM users WHERE id = ?")
      .get(id);
  }

  public findByEmail(email: string): UserType | null {
    return this.database
      .query<UserType, [string]>("SELECT * FROM users WHERE email = ?")
      .get(email.toLowerCase().trim());
  }

  public create(item: UserRegisterType): UserType | null {
    return this.database
      .query<
        UserType,
        [string, string, string]
      >("INSERT INTO users (title, email, password) VALUES (?, ?) RETURNING *")
      .get(item.title, item.email.toLowerCase().trim(), item.password);
  }
}
