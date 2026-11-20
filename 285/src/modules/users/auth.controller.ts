import { Context, Hono, type Next, type TypedResponse } from "hono";
import type { UsersRepository } from "./users.repository";
import type { ApplicationEnvironment, ApplicationResult } from "../application.types";
import { userAuthSchema, userRegisterSchema, type UserAuthType, type UserRegisterType, type UserTokenType, type UserType } from "./users.types";
import { ApplicationValidator } from "../application.validator";

export class AuthController {
	constructor(private readonly repository: UsersRepository) { }

	public routes(): Hono {
		return new Hono()
			.post("/register", ApplicationValidator.validate("json", userRegisterSchema), this.register.bind(this))
			.post("/auth", ApplicationValidator.validate("json", userAuthSchema), this.auth.bind(this))
			.get("/me", this.me.bind(this))
	}

	public async register(
		c: Context<
			ApplicationEnvironment,
			"/register", {
				out: {
					json: UserRegisterType;
				}
			}
		>
	): Promise<TypedResponse<ApplicationResult<UserTokenType>>> { }

	public async auth(
		c: Context<
			ApplicationEnvironment,
			"/auth", {
				out: {
					json: UserAuthType;
				}
			}
		>
	): Promise<TypedResponse<ApplicationResult<UserTokenType>>> { }

	public async me(c: Context<ApplicationEnvironment>): Promise<TypedResponse<ApplicationResult<UserType>>> {
		return c.json({ success: true, data: c.get("user") });
	}

	public async validate(c: Context<ApplicationEnvironment>, next: Next) { }
}