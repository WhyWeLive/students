import { Context, Hono, type TypedResponse } from "hono";

import { UsersRepository } from "./users.repository";
import type {
  ApplicationEnvironment,
  ApplicationResult,
  IDParamType,
} from "../application.types";
import type { UserCreateType, UserType, UserUpdateType } from "./users.types";

export class UsersController {
  private readonly repository: UsersRepository;

  constructor(repository: UsersRepository) {
    this.repository = repository;
  }

  public routes(): Hono {
    return new Hono()
      .get("/", this.findAll.bind(this))
      .get("/:id/", this.findById.bind(this))
      .post("/", this.create.bind(this))
      .patch("/:id/", this.updateById.bind(this))
      .delete("/:id/", this.deleteById.bind(this));
  }

  public async findAll(
    c: Context,
  ): Promise<TypedResponse<ApplicationResult<UserType[]>>> {
    return c.json({ success: true, data: this.repository.findAll() });
  }

  public async findById(
    c: Context<
      ApplicationEnvironment,
      "/:id/",
      { out: { param: IDParamType } }
    >,
  ): Promise<TypedResponse<ApplicationResult<UserType>>> {}

  public async create(
    c: Context<
      ApplicationEnvironment,
      "/",
      { out: { param: IDParamType; json: UserCreateType } }
    >,
  ): Promise<TypedResponse<ApplicationResult<UserType>>> {}

  public async updateById(
    c: Context<
      ApplicationEnvironment,
      "/:id/",
      { out: { param: IDParamType; json: UserUpdateType } }
    >,
  ): Promise<TypedResponse<ApplicationResult<UserType>>> {}

  public async deleteById(
    c: Context<
      ApplicationEnvironment,
      "/:id/",
      { out: { param: IDParamType } }
    >,
  ): Promise<TypedResponse<ApplicationResult<UserType>>> {}
}
