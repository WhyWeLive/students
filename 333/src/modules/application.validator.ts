import { z } from "zod";
import type { Context, ValidationTargets } from "hono";
import { zValidator } from "@hono/zod-validator";

export class ApplicationValidator {
  public static validate<
    T extends z.ZodType,
    Target extends keyof ValidationTargets,
  >(target: Target, schema: T) {
    return zValidator(target, schema, this.onValidate.bind(this));
  }

  public static onValidate(result: {
    success: boolean;
    error?: {message: string};
  }, c: Context) {
    if (!result.success) {
      return c.json({
        success: false,
        error: result.error?.message ?? "Invalid input",
      }, 400);
    }
  }
}
