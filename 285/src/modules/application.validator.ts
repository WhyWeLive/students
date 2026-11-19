import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type z from "zod";

export class ApplicationValidator {
    public static validate<
        T extends z.ZodType,
        Target extends keyof ValidationTargets,
    >(target: Target, schema: T) {
        return zValidator(target, schema, this.onValidate.bind(this));
    };

    public static onValidate(result: {
        success: boolean;
        error?: unknown; // CHANGED
    }): void {
        if (!result.success) {
            throw result.error;
        }
    }
}