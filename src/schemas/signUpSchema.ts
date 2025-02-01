import { z } from "zod";

export const usernameValidaion =z
.string()
.min(4, "Username must be at least 4 characters")
.max(20, "Username must be less than 20 characters")
.regex(/^[a-zA-Z0-9._-]+$/, "Username must not contain special characters other than '.', '_', or '-'");


export const signUpSchema = z.object({
  username: usernameValidaion,
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(6, {
    message: `Password must be at least 6 characters`,
  }),
});
