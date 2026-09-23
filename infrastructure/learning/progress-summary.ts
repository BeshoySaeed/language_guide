import { and, eq, isNull, sql } from "drizzle-orm";

import { getDb } from "@/db";
import {
  attempts,
  challengeAttempts,
  lessonProgress,
  reviewEvents,
  reviewItems,
  savedItems,
  userPreferences,
} from "@/db/schema";
import {
  summarizeLearningActivity,
  type LearningActivitySummary,
  type RecordedLearningActivity,
} from "@/packages/domain/src/learning-activity";

export type RecentLearningActivity = Readonly<{
  id: string;
  kind: RecordedLearningActivity["kind"];
  occurredAt: string;
  title: string;
  detail: string;
}>;

export type ProgressSummary = LearningActivitySummary & Readonly<{
  dailyGoalMinutes: number;
  lessonsCompleted: number;
  wordsSaved: number;
  wordsMastered: number;
  reviewsCompleted: number;
  practiceSessions: number;
  bestQuizScore: number;
  recentActivity: readonly RecentLearningActivity[];
  timeZone: string;
}>;

const DEFAULT_TIME_ZONE = "Africa/Cairo";
const DEFAULT_DAILY_GOAL_MINUTES = 20;

export async function loadProgressSummary(userId: string, now = new Date()): Promise<ProgressSummary> {
  const db = getDb();
  const [
    preferenceRows,
    assessmentRows,
    challengeRows,
    reviewRows,
    completedLessonRows,
    savedWordRows,
    masteredWordRows,
    bestQuizRows,
  ] = await Promise.all([
    db.select({ timeZone: userPreferences.timezone, dailyGoalMinutes: userPreferences.dailyGoalMinutes }).from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1),
    db.select({ id: attempts.id, assessmentType: attempts.assessmentType, startedAt: attempts.startedAt, completedAt: attempts.completedAt, score: attempts.score, maxScore: attempts.maxScore }).from(attempts).where(eq(attempts.userId, userId)),
    db.select({ id: challengeAttempts.id, startedAt: challengeAttempts.startedAt, completedAt: challengeAttempts.completedAt, durationMs: challengeAttempts.durationMs, score: challengeAttempts.score, maxScore: challengeAttempts.maxScore }).from(challengeAttempts).where(eq(challengeAttempts.userId, userId)),
    db.select({ id: reviewEvents.id, reviewedAt: reviewEvents.reviewedAt, rating: reviewEvents.rating }).from(reviewEvents).where(eq(reviewEvents.userId, userId)),
    db.select({ count: sql<number>`count(*)` }).from(lessonProgress).where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.state, "completed"))),
    db.select({ count: sql<number>`count(*)` }).from(savedItems).where(and(eq(savedItems.userId, userId), eq(savedItems.contentType, "vocabulary"), isNull(savedItems.deletedAt))),
    db.select({ count: sql<number>`count(*)` }).from(reviewItems).innerJoin(savedItems, eq(savedItems.id, reviewItems.savedItemId)).where(and(eq(reviewItems.userId, userId), eq(reviewItems.state, "mastered"), eq(savedItems.contentType, "vocabulary"), isNull(savedItems.deletedAt))),
    db.select({ best: sql<number>`coalesce(max(round(100.0 * ${attempts.score} / nullif(${attempts.maxScore}, 0))), 0)` }).from(attempts).where(and(eq(attempts.userId, userId), eq(attempts.assessmentType, "quiz"))),
  ]);

  const preference = preferenceRows[0];
  const timeZone = validTimeZone(preference?.timeZone) ? preference.timeZone : DEFAULT_TIME_ZONE;
  const activities: RecordedLearningActivity[] = [
    ...assessmentRows.map((attempt) => ({
      kind: "assessment" as const,
      occurredAt: attempt.completedAt,
      durationMs: elapsedMs(attempt.startedAt, attempt.completedAt),
    })),
    ...challengeRows.map((attempt) => ({
      kind: "challenge" as const,
      occurredAt: attempt.completedAt,
      durationMs: attempt.durationMs,
    })),
    ...reviewRows.map((review) => ({
      kind: "review" as const,
      occurredAt: review.reviewedAt,
      durationMs: 0,
    })),
  ];
  const activitySummary = summarizeLearningActivity(activities, now, timeZone);
  const recentActivity: RecentLearningActivity[] = [
    ...assessmentRows.map((attempt) => ({
      id: attempt.id,
      kind: "assessment" as const,
      occurredAt: attempt.completedAt,
      title: attempt.assessmentType === "quiz" ? "Lesson quiz completed" : "Guided practice completed",
      detail: `${attempt.score} of ${attempt.maxScore} correct`,
    })),
    ...challengeRows.map((attempt) => ({
      id: attempt.id,
      kind: "challenge" as const,
      occurredAt: attempt.completedAt,
      title: "Daily workout completed",
      detail: `${attempt.score} of ${attempt.maxScore} correct`,
    })),
    ...reviewRows.map((review) => ({
      id: review.id,
      kind: "review" as const,
      occurredAt: review.reviewedAt,
      title: "Vocabulary reviewed",
      detail: `Rated ${review.rating}`,
    })),
  ].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt)).slice(0, 6);

  return {
    ...activitySummary,
    dailyGoalMinutes: positiveGoal(preference?.dailyGoalMinutes),
    lessonsCompleted: Number(completedLessonRows[0]?.count ?? 0),
    wordsSaved: Number(savedWordRows[0]?.count ?? 0),
    wordsMastered: Number(masteredWordRows[0]?.count ?? 0),
    reviewsCompleted: reviewRows.length,
    practiceSessions: assessmentRows.length + challengeRows.length,
    bestQuizScore: Number(bestQuizRows[0]?.best ?? 0),
    recentActivity,
    timeZone,
  };
}

export function emptyProgressSummary(now = new Date(), timeZone = DEFAULT_TIME_ZONE): ProgressSummary {
  return {
    ...summarizeLearningActivity([], now, timeZone),
    dailyGoalMinutes: DEFAULT_DAILY_GOAL_MINUTES,
    lessonsCompleted: 0,
    wordsSaved: 0,
    wordsMastered: 0,
    reviewsCompleted: 0,
    practiceSessions: 0,
    bestQuizScore: 0,
    recentActivity: [],
    timeZone,
  };
}

function elapsedMs(startedAt: string, completedAt: string): number {
  return Math.max(0, new Date(completedAt).getTime() - new Date(startedAt).getTime());
}

function positiveGoal(value: number | undefined): number {
  return value && value > 0 ? value : DEFAULT_DAILY_GOAL_MINUTES;
}

function validTimeZone(value: string | undefined): value is string {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}
