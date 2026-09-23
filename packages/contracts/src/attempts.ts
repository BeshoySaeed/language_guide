import { z } from "zod";

export const attemptSubmissionSchema = z.object({
  lessonId: z.string().min(1).max(100),
  assessmentType: z.enum(["practice", "quiz"]),
  clientOperationId: z.string().min(8).max(100),
  startedAt: z.string().datetime(),
  answers: z.array(z.object({
    exerciseId: z.string().min(1).max(100),
    response: z.string().max(500),
  })).min(1).max(30),
});

export type AttemptSubmission = z.infer<typeof attemptSubmissionSchema>;
