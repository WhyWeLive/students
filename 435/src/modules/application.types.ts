import z, { number } from "zod";

export type ApplicationEnvironment = {
    Variables: {}
};

export type ApplicationResult<T> = ApplicationSuccessResult<T> | ApplicationFailedResult;

export type ApplicationSuccessResult<T> = {
    success: true;
    data: T;
}

export type ApplicationFailedResult = {
    success: false;
    error: string;
}

const IDParamSchema = z.object({
    id: z.string()
        .regex(/^\d+$/)
        .transform(value => parseInt(value, 10)),
});

export type IDParamType = z.infer<typeof IDParamSchema>;