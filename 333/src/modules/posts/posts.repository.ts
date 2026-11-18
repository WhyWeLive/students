import { Database } from "bun:sqlite";
import { type PostType } from "./posts.types";

export class PostsRepository {
  constructor(private readonly database: Database) { }

  public init(): void {
    this.database.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        userId INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    `);
  }

  public findAll(): PostType[] {
    return this.database.query<PostType, []>("SELECT * FROM posts").all();
  }

  public findById(id: number): PostType | null {
    return this.database
      .query<PostType, [number]>("SELECT * FROM posts WHERE id = ?")
      .get(id);
  }

  public create(content: string, userId: number): PostType | null {
    return this.database
      .query<
        PostType,
        [string, number]
      >("INSERT INTO posts (content, userId) VALUES (?, ?) RETURNING id, content, userId")
      .get(content, userId);
  }
}
