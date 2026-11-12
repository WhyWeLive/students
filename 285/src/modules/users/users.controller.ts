import { Context, Hono, type TypedResponse } from "hono";
import { UsersRepository } from "./users.repository";
import type { ApplicationResult } from "../application.types";
import type {UserType} from './users.types';

export class UsersController {
  constructor(private readonly repository: UsersRepository) {}

  public routes(): Hono {
    return new Hono()
      .get('/', this.findAll.bind(this))
  }

  public async findAll(c: Context): Promise<
    TypedResponse<ApplicationResult<UserType[]>>
  > {
    return c.json({
      success: true,
      data: [
        {
          id: 1,
          title: "TEST",
          email: "hello@nke.ru"
        }
      ]
    })
  }
}
