import { z } from "zod";

const emailSchema = z.string().trim().email("Enter a valid email address.").max(254).transform((value) => value.toLocaleLowerCase("en-US"));
const passwordSchema = z.string()
  .min(10, "Use at least 10 characters.")
  .max(128, "Use no more than 128 characters.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const registerInputSchema = z.object({
  displayName: z.string().trim().min(2, "Enter at least 2 characters.").max(60, "Use no more than 60 characters."),
  email: emailSchema,
  password: passwordSchema,
});

export const loginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(128),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
