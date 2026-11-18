
import { Database } from "bun:sqlite";
import { PostsRepository } from "./posts.repository";
import { PostsController } from "./posts.controller";

export class PostsModule {
  private readonly repository: PostsRepository;
  private readonly controller: PostsController;

  constructor(database: Database) {
    this.repository = new PostsRepository(database);
    this.controller = new PostsController(this.repository);
  }

  public init() {
    this.repository.init();

    return this.controller.routes();
  }
}
