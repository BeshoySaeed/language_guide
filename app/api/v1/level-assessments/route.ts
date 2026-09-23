import { and, eq } from "drizzle-orm";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { challengeAttempts, levelAssessmentResults, users } from "@/db/schema";
import { getGermanLevelAssessment } from "@/infrastructure/catalog/level-assessment";
import { apiError, validationError } from "@/lib/api-response";
import { levelAssessmentSubmissionSchema } from "@/packages/contracts/src/level-assessments";
import { gradeLevelAssessment } from "@/packages/domain/src/level-assessment";

export async function POST(request: Request) {
  const parsed = levelAssessmentSubmissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const assessment = getGermanLevelAssessment(parsed.data.levelCode);
  if (assessment.id !== parsed.data.assessmentId) return apiError("LEVEL_TEST_NOT_FOUND", "That level test is not available.", 404);

  const startedAt = new Date(parsed.data.startedAt);
  const completedAt = new Date();
  if (startedAt.getTime() > completedAt.getTime() + 60_000 || startedAt.getTime() < completedAt.getTime() - 3_600_000 * 3) {
    return apiError("INVALID_START_TIME", "The level test start time is outside the accepted range.", 400);
  }

  const grade = gradeLevelAssessment(assessment, parsed.data.answers);
  const feedback = grade.answers.map((answer) => {
    const question = assessment.questions.find((candidate) => candidate.id === answer.exerciseId);
    return {
      ...answer,
      skill: question?.skill,
      correctAnswer: question?.correctAnswer ?? "",
      explanation: question?.explanation ?? "",
    };
  });
  const user = await getChatGPTUser();
  const responseData = { ...grade, answers: feedback, saved: false, replayed: false, attemptId: null as string | null };
  if (!user) return Response.json({ data: responseData });

  try {
    const db = getDb();
    const [existing] = await db.select().from(challengeAttempts).where(and(
      eq(challengeAttempts.userId, user.userId),
      eq(challengeAttempts.clientOperationId, parsed.data.clientOperationId),
    )).limit(1);
    if (existing) {
      const [savedResult] = await db.select().from(levelAssessmentResults).where(eq(levelAssessmentResults.attemptId, existing.id)).limit(1);
      return Response.json({ data: {
        ...responseData,
        attemptId: existing.id,
        score: existing.score,
        maxScore: existing.maxScore,
        percent: Math.round((existing.score / existing.maxScore) * 100),
        passed: existing.passed,
        ...(savedResult ? { skills: savedResult.skills, weakSkills: savedResult.weakSkills, recommendedLessons: savedResult.recommendedLessons } : {}),
        saved: true,
        replayed: true,
      } });
    }

    const attemptId = crypto.randomUUID();
    const completedAtIso = completedAt.toISOString();
    await db.batch([
      db.insert(users).values({ id: user.userId, email: user.email, displayName: user.displayName, updatedAt: completedAtIso }).onConflictDoUpdate({ target: users.id, set: { email: user.email, displayName: user.displayName, updatedAt: completedAtIso } }),
      db.insert(challengeAttempts).values({
        id: attemptId,
        userId: user.userId,
        challengeId: assessment.id,
        seed: "level-test-v1",
        languageCode: assessment.languageCode,
        levelCode: assessment.levelCode,
        mode: "level_test",
        startedAt: parsed.data.startedAt,
        completedAt: completedAtIso,
        durationMs: Math.max(0, completedAt.getTime() - startedAt.getTime()),
        score: grade.score,
        maxScore: grade.maxScore,
        passed: grade.passed,
        clientOperationId: parsed.data.clientOperationId,
      }),
      db.insert(levelAssessmentResults).values({
        attemptId,
        userId: user.userId,
        languageCode: assessment.languageCode,
        levelCode: assessment.levelCode,
        overallPercent: grade.percent,
        skills: grade.skills,
        weakSkills: grade.weakSkills,
        recommendedLessons: grade.recommendedLessons,
        passed: grade.passed,
        completedAt: completedAtIso,
      }),
    ]);
    return Response.json({ data: { ...responseData, attemptId, saved: true } }, { status: 201 });
  } catch (error) {
    console.error("Failed to save level assessment", error);
    return apiError("STORAGE_UNAVAILABLE", "Your level-test result could not be saved.", 503);
  }
}
