import { and, eq, sql } from "drizzle-orm";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import {
  attemptAnswers,
  attempts,
  books,
  chapters,
  languageLevels,
  languages,
  learningEvents,
  lessonProgress,
  lessons,
  levels,
  users,
} from "@/db/schema";
import { GERMAN_LEVELS, getAssessmentQuestions, getLessonContextById } from "@/infrastructure/catalog/lesson-content";
import { apiError, validationError } from "@/lib/api-response";
import { attemptSubmissionSchema } from "@/packages/contracts/src/attempts";
import { gradeAttempt } from "@/packages/domain/src/assessment";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return apiError("UNAUTHENTICATED", "Sign in to save your attempt and progress.", 401);

  const parsed = attemptSubmissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const lessonContext = getLessonContextById(parsed.data.lessonId);
  const lesson = lessonContext?.lesson;
  const questions = getAssessmentQuestions(parsed.data.lessonId, parsed.data.assessmentType);
  if (!lessonContext || !lesson || !questions || !lesson.practice || !lesson.quiz) {
    return apiError("ASSESSMENT_NOT_FOUND", "That assessment is not available.", 404);
  }

  const assessment = parsed.data.assessmentType === "quiz" ? lesson.quiz : lesson.practice;
  const grade = gradeAttempt(questions, parsed.data.answers, assessment.passThreshold);
  const now = new Date().toISOString();
  const startedAt = new Date(parsed.data.startedAt);
  const maximumOfflineAgeMs = 30 * 24 * 60 * 60 * 1_000;
  if (startedAt.getTime() > Date.now() + 60_000 || startedAt.getTime() < Date.now() - maximumOfflineAgeMs) {
    return apiError("INVALID_START_TIME", "The attempt start time is outside the accepted range.", 400);
  }

  try {
    const db = getDb();
    const [existing] = await db.select().from(attempts).where(and(
      eq(attempts.userId, user.userId),
      eq(attempts.clientOperationId, parsed.data.clientOperationId),
    )).limit(1);

    if (existing) {
      const savedAnswers = await db.select().from(attemptAnswers).where(eq(attemptAnswers.attemptId, existing.id));
      return Response.json({
        data: {
          attemptId: existing.id,
          score: existing.score,
          maxScore: existing.maxScore,
          percent: Math.round((existing.score / existing.maxScore) * 100),
          passed: existing.passed,
          answers: attachFeedback(savedAnswers, questions),
          replayed: true,
        },
      });
    }

    const attemptId = crypto.randomUUID();
    const eventId = crypto.randomUUID();
    const progressPercent = parsed.data.assessmentType === "quiz" && grade.passed ? 100 : parsed.data.assessmentType === "quiz" ? 88 : 75;
    const progressState = parsed.data.assessmentType === "quiz" && grade.passed ? "completed" as const : "in_progress" as const;
    const completedAt = progressState === "completed" ? now : null;
    const { book, chapter, chapterOrder, order } = lessonContext;
    const levelRank = GERMAN_LEVELS.indexOf(book.levelCode) + 1;

    await db.batch([
      db.insert(users).values({ id: user.userId, email: user.email, displayName: user.displayName, updatedAt: now }).onConflictDoUpdate({ target: users.id, set: { email: user.email, displayName: user.displayName, updatedAt: now } }),
      db.insert(languages).values({ code: "de", name: "German", nativeName: "Deutsch", direction: "ltr", updatedAt: now }).onConflictDoNothing(),
      db.insert(levels).values({ code: book.levelCode, rank: levelRank }).onConflictDoNothing(),
      db.insert(languageLevels).values({ languageCode: book.languageCode, levelCode: book.levelCode }).onConflictDoNothing(),
      db.insert(books).values({ id: book.id, languageCode: book.languageCode, levelCode: book.levelCode, slug: book.slug, title: book.title, description: book.description, status: "published", revision: book.revision, sortOrder: levelRank, updatedAt: now }).onConflictDoUpdate({ target: books.id, set: { title: book.title, description: book.description, revision: book.revision, updatedAt: now } }),
      db.insert(chapters).values({ id: chapter.id, bookId: book.id, slug: chapter.slug, title: chapter.title, sortOrder: chapterOrder, status: "published", updatedAt: now }).onConflictDoUpdate({ target: chapters.id, set: { title: chapter.title, sortOrder: chapterOrder, updatedAt: now } }),
      db.insert(lessons).values({ id: lesson.id, chapterId: chapter.id, slug: lesson.slug, title: lesson.title, summary: lesson.summary, estimatedMinutes: lesson.estimatedMinutes, sortOrder: order, status: "published", revision: lesson.revision, updatedAt: now }).onConflictDoUpdate({ target: lessons.id, set: { title: lesson.title, summary: lesson.summary, revision: lesson.revision, updatedAt: now } }),
      db.insert(attempts).values({ id: attemptId, userId: user.userId, assessmentType: parsed.data.assessmentType, assessmentId: assessment.id, lessonId: lesson.id, contentRevision: lesson.revision, startedAt: parsed.data.startedAt, completedAt: now, score: grade.score, maxScore: grade.maxScore, passed: grade.passed, clientOperationId: parsed.data.clientOperationId }),
      ...grade.answers.map((answer) => db.insert(attemptAnswers).values({ id: `${attemptId}:${answer.exerciseId}`, attemptId, exerciseId: answer.exerciseId, promptSnapshot: answer.promptSnapshot, response: answer.response, correct: answer.correct, score: answer.score, feedbackCode: answer.feedbackCode, answeredAt: now })),
      db.insert(lessonProgress).values({ userId: user.userId, lessonId: lesson.id, state: progressState, percent: progressPercent, bestScore: grade.percent, attemptsCount: 1, completedAt, updatedAt: now }).onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          state: sql`CASE WHEN ${lessonProgress.state} = 'completed' OR ${progressState} = 'completed' THEN 'completed' ELSE 'in_progress' END`,
          percent: sql`MAX(${lessonProgress.percent}, ${progressPercent})`,
          bestScore: sql`MAX(${lessonProgress.bestScore}, ${grade.percent})`,
          attemptsCount: sql`${lessonProgress.attemptsCount} + 1`,
          completedAt: completedAt ? sql`COALESCE(${lessonProgress.completedAt}, ${completedAt})` : lessonProgress.completedAt,
          version: sql`${lessonProgress.version} + 1`,
          updatedAt: now,
        },
      }),
      db.insert(learningEvents).values({ id: eventId, userId: user.userId, type: "assessment.completed", entityType: parsed.data.assessmentType, entityId: assessment.id, payload: { lessonId: lesson.id, score: grade.score, maxScore: grade.maxScore, percent: grade.percent, passed: grade.passed, contentRevision: lesson.revision }, occurredAt: now, clientOperationId: `${parsed.data.clientOperationId}:event` }),
    ]);

    return Response.json({
      data: {
        attemptId,
        ...grade,
        answers: grade.answers.map((answer) => ({
          ...answer,
          correctAnswer: questions.find((question) => question.id === answer.exerciseId)?.correctAnswer ?? "",
          explanation: questions.find((question) => question.id === answer.exerciseId)?.explanation ?? "",
        })),
        progress: { state: progressState, percent: progressPercent },
        replayed: false,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to save assessment attempt", error);
    return apiError("STORAGE_UNAVAILABLE", "Your answers could not be saved. Please try again.", 503);
  }
}

function attachFeedback(
  savedAnswers: readonly (typeof attemptAnswers.$inferSelect)[],
  questions: NonNullable<ReturnType<typeof getAssessmentQuestions>>,
) {
  return savedAnswers.map((answer) => ({
    exerciseId: answer.exerciseId,
    promptSnapshot: answer.promptSnapshot,
    response: answer.response,
    correct: answer.correct,
    score: answer.score,
    feedbackCode: answer.feedbackCode,
    correctAnswer: questions.find((question) => question.id === answer.exerciseId)?.correctAnswer ?? "",
    explanation: questions.find((question) => question.id === answer.exerciseId)?.explanation ?? "",
  }));
}
