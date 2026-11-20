import z from "zod";
import type { UserType } from "./users/users.types";

export type ApplicationEnvironment = {
    Variables: {
        user: UserType; // CHANGED
    }

    Bindings: {
        JWT_SECRET: string; // CHANGED
    }
}

export type ApplicationResult<T> = ApplicationSuccessResult<T> | ApplicationFailedResult;

export type ApplicationSuccessResult<T> = {
    success: true;
    data: T;
};

export type ApplicationFailedResult = {
    success: false;
    error: string;
}

export const IDParamSchema = z.object({
    id: z.string().regex(/^\d+$/, "Id must be number")
        .transform(value => parseInt(value, 10)),
});

export type IDParamType = z.infer<typeof IDParamSchema>;