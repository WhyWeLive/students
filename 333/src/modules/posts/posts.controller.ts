import type { PostsRepository } from "./posts.repository";
import { Context, Hono, type TypedResponse } from "hono";
import {
  IDParamSchema,
  type ApplicationEnviroment,
  type ApplicationResult,
  type IDParamType,
} from "../application.types";
import { type PostType } from "./posts.types";
import { ApplicationValidator } from "../application.validator";

export class PostsController {
  private readonly repository: PostsRepository;

  constructor(repository: PostsRepository) {
    this.repository = repository;
  }

  public routes(): Hono {
    return new Hono()
      .get("/", this.findAll.bind(this))
      .get(
        "/:id",
        ApplicationValidator.validate("param", IDParamSchema),
        this.findOne.bind(this),
      );
  }

  public async findAll(
    c: Context,
  ): Promise<TypedResponse<ApplicationResult<PostType[]>>> {
    return c.json({ success: true, data: this.repository.findAll() });
  }

  public async findOne(
    c: Context<ApplicationEnviroment, "/:id", { out: { param: IDParamType } }>,
  ): Promise<TypedResponse<ApplicationResult<PostType>>> {
    const { id } = c.req.valid("param");
    const post = this.repository.findById(id);

    if (!post) {
      return c.json({ success: false, error: "Post not found" }, 404);
    }

    return c.json({ success: true, data: post });
  }
}
