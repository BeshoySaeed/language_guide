import { and, eq } from "drizzle-orm";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { challengeAttempts, users } from "@/db/schema";
import { getPracticeChallenge, getPublicPracticeChallenge, isGermanLevel } from "@/infrastructure/catalog/lesson-content";
import { apiError, validationError } from "@/lib/api-response";
import { practiceAttemptSchema, practiceSeedSchema } from "@/packages/contracts/src/practice";
import { gradePracticeChallenge } from "@/packages/domain/src/practice-challenge";

export async function GET(request: Request) {
  const requestedSeed = new URL(request.url).searchParams.get("seed") ?? dailySeed();
  const requestedLevel = new URL(request.url).searchParams.get("level") ?? "A1";
  const seed = practiceSeedSchema.safeParse(requestedSeed);
  if (!seed.success) return validationError(seed.error);
  if (!isGermanLevel(requestedLevel)) return apiError("LEVEL_NOT_FOUND", "That German level is not available.", 404);
  return Response.json({ data: getPublicPracticeChallenge(seed.data, requestedLevel) });
}

export async function POST(request: Request) {
  const parsed = practiceAttemptSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const challenge = getPracticeChallenge(parsed.data.seed, parsed.data.levelCode);
  if (challenge.id !== parsed.data.challengeId) return apiError("CHALLENGE_NOT_FOUND", "That practice challenge is not available.", 404);

  const startedAt = new Date(parsed.data.startedAt);
  const completedAt = new Date();
  if (startedAt.getTime() > completedAt.getTime() + 60_000 || startedAt.getTime() < completedAt.getTime() - 86_400_000) {
    return apiError("INVALID_START_TIME", "The practice start time is outside the accepted range.", 400);
  }

  const grade = gradePracticeChallenge(challenge, parsed.data.answers);
  const feedback = grade.answers.map((answer) => {
    const question = challenge.questions.find((candidate) => candidate.id === answer.exerciseId);
    return { ...answer, type: question?.type, correctAnswer: question?.correctAnswer ?? "", explanation: question?.explanation ?? "" };
  });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ data: { attemptId: null, ...grade, answers: feedback, saved: false, replayed: false } });

  try {
    const db = getDb();
    const [existing] = await db.select().from(challengeAttempts).where(and(
      eq(challengeAttempts.userId, user.userId),
      eq(challengeAttempts.clientOperationId, parsed.data.clientOperationId),
    )).limit(1);
    if (existing) {
      return Response.json({ data: { attemptId: existing.id, ...grade, score: existing.score, maxScore: existing.maxScore, percent: Math.round((existing.score / existing.maxScore) * 100), passed: existing.passed, answers: feedback, saved: true, replayed: true } });
    }

    const attemptId = crypto.randomUUID();
    const completedAtIso = completedAt.toISOString();
    await db.batch([
      db.insert(users).values({ id: user.userId, email: user.email, displayName: user.displayName, updatedAt: completedAtIso }).onConflictDoUpdate({ target: users.id, set: { email: user.email, displayName: user.displayName, updatedAt: completedAtIso } }),
      db.insert(challengeAttempts).values({
        id: attemptId,
        userId: user.userId,
        challengeId: challenge.id,
        seed: challenge.seed,
        languageCode: challenge.languageCode,
        levelCode: challenge.levelCode,
        mode: "mixed",
        startedAt: parsed.data.startedAt,
        completedAt: completedAtIso,
        durationMs: Math.max(0, completedAt.getTime() - startedAt.getTime()),
        score: grade.score,
        maxScore: grade.maxScore,
        passed: grade.passed,
        clientOperationId: parsed.data.clientOperationId,
      }),
    ]);

    return Response.json({ data: { attemptId, ...grade, answers: feedback, saved: true, replayed: false } }, { status: 201 });
  } catch (error) {
    console.error("Failed to save practice attempt", error);
    return apiError("STORAGE_UNAVAILABLE", "Your practice result could not be saved.", 503);
  }
}

function dailySeed() {
  return `daily-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}`;
}
