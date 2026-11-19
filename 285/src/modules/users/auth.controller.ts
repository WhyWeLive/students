import { Hono } from "hono";
import type { UsersRepository } from "./users.repository";

export class AuthController {
    constructor(private readonly repository: UsersRepository) { }

    public routes(): Hono {
        return new Hono();
    }
}