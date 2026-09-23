import { z } from "zod";

export const saveVocabularySchema = z.object({
  contentItemId: z.string().startsWith("vocab_").max(120),
  sourceLessonId: z.string().startsWith("lesson_").max(120),
  difficult: z.boolean().optional().default(false),
});

export const reviewRatingSchema = z.object({
  reviewItemId: z.string().min(1).max(240),
  rating: z.enum(["again", "hard", "good", "easy"]),
  clientOperationId: z.string().min(8).max(100),
});
