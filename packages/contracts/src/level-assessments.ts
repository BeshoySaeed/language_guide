import { z } from "zod";

export const levelAssessmentSubmissionSchema = z.object({
  assessmentId: z.string().min(8).max(120),
  levelCode: z.enum(["A1", "A2", "B1"]),
  clientOperationId: z.string().min(8).max(100),
  startedAt: z.string().datetime(),
  answers: z.array(z.object({
    exerciseId: z.string().min(1).max(160),
    response: z.string().max(500),
  })).min(15).max(30),
});

export type LevelAssessmentSubmission = z.infer<typeof levelAssessmentSubmissionSchema>;
