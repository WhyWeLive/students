import z from "zod";

const UserSchema = z.object({
  id: z.number(),
  title: z.string(),
  email: z.email(),
  password: z.string(),
});

const UserRegisterSchema = UserSchema.omit({ id: true });
const UserAuthSchema = UserSchema.pick({ email: true, password: true });
const UserAuthenticationSchema = z.object({ token: z.string() });

export type UserType = z.infer<typeof UserSchema>;
export type UserRegisterType = z.infer<typeof UserRegisterSchema>;
export type UserAuthType = z.infer<typeof UserAuthSchema>;
export type UserAuthenticationType = z.infer<typeof UserAuthenticationSchema>;
