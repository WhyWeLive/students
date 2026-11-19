import { Context, Hono, type TypedResponse } from "hono";
import type { PostsRepository } from "./posts.repository";
import {
  IDParamSchema,
  type ApplicationEnviroment,
  type ApplicationResult,
  type IDParamType,
} from "../application.types";
import { ApplicationValidator } from "../application.validator";
import { postCreateSchema, type PostCreateType, type PostType } from "./posts.types";

export class PostsController {
  constructor(private readonly repository: PostsRepository) {}

  public routes(): Hono {
    return new Hono()
      .get("/", this.findAll.bind(this))
      .get(
        "/:id",
        ApplicationValidator.validate("param", IDParamSchema),
        this.findOne.bind(this),
      )
      .post(
        "/",
        ApplicationValidator.validate("json", postCreateSchema),
        this.create.bind(this),
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

  public async create(
    c: Context<ApplicationEnviroment, "/", { out: { json: PostCreateType } }>,
  ): Promise<TypedResponse<ApplicationResult<PostType>>> {
    const { title, content } = c.req.valid("json");
    const userId = c.get("user").id;
    const post = this.repository.create(title, content, userId);

    if (!post) {
      return c.json({ success: false, error: "Post creation failed" }, 500);
    }

    return c.json({ success: true, data: post }, 201);
  }
}
