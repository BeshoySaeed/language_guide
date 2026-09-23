import { z } from "zod";

export const practiceSeedSchema = z.string().min(1).max(40).regex(/^[a-zA-Z0-9_-]+$/);

export const practiceAttemptSchema = z.object({
  challengeId: z.string().min(1).max(120),
  levelCode: z.enum(["A1", "A2", "B1"]),
  seed: practiceSeedSchema,
  clientOperationId: z.string().min(8).max(100),
  startedAt: z.string().datetime(),
  answers: z.array(z.object({ exerciseId: z.string().min(1).max(160), response: z.string().max(500) })).length(8),
});
