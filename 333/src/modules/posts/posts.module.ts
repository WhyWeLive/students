import { Database } from "bun:sqlite";
import { PostsRepository } from "./posts.repository";
import { PostsController } from "./posts.controller";

export class PostsModule {
  private readonly repository: PostsRepository;
  private readonly postsController: PostsController;

  constructor(database: Database) {
    this.repository = new PostsRepository(database);
    this.postsController = new PostsController(this.repository);
  }

  public init() {
    this.repository.init();

    return this.postsController.routes();
  }
}
