import z from "zod";

export const UserSchema = z.object({
  id: z.number(),
  title: z.string(),
  email: z.email(),
});

export const UserCreateSchema = UserSchema.omit({ id: true });
export const UserUpdateSchema = UserCreateSchema.partial();

export type UserType = z.infer<typeof UserSchema>;
export type UserCreateType = z.infer<typeof UserCreateSchema>;
export type UserUpdateType = z.infer<typeof UserUpdateSchema>;