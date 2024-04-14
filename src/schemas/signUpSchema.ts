import {z} from "zod"

export const usernameValidation = z.string().min(2).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username must not contain any special characters")

export const userSignupSchema = z.object({
  username: usernameValidation,
  email: z.string().email({message: "Invalid Email Validation"}),
  password: z.string().min(8, "password must be at least 6 characters")
})