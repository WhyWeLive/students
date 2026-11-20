import { Database } from "bun:sqlite";
import type { UserType } from "./users.types";

export class UsersRepository {
  constructor(private readonly database: Database) { }

  public init(): void {
    this.database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL
      );
    `);
  }

  public findById(id: number): UserType | null {
    return this.database
      .query<UserType, { $id: number }>("SELECT * FROM users WHERE id = $id")
      .get({ $id: id });
  }

  public findByEmail(email: string): UserType | null {
    return this.database
      .query<UserType, { $email: string }>("SELECT * FROM users WHERE email = $email")
      .get({ $email: email.trim().toLowerCase() });
  }

  public create(title: string, email: string, password: string): UserType | null {
    return this.database
      .query<UserType, { $title: string; $email: string; $password: string }>(`
        INSERT INTO users (title, email, password)
         VALUES ($title, $email, $password) RETURN id, title, email
      `)
      .get({ $title: title, $email: email, $password: password });
  }
}
