import { z } from "zod";

export const cefrLevelSchema = z.enum(["A1", "A2", "B1"]);
export const languageCodeSchema = z.literal("de");

export const languageSchema = z.object({
  code: languageCodeSchema,
  name: z.string().min(1),
  nativeName: z.string().min(1),
  flag: z.string().min(1),
  direction: z.enum(["ltr", "rtl"]),
  availableLevels: z.array(cefrLevelSchema).min(1),
});

export const enrollmentInputSchema = z.object({
  languageCode: languageCodeSchema,
  level: cefrLevelSchema,
});

export type EnrollmentInput = z.infer<typeof enrollmentInputSchema>;
