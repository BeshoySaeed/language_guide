import type { ReviewState } from "./progress.ts";

export type ReviewRating = "again" | "hard" | "good" | "easy";

export type ReviewScheduleInput = Readonly<{
  state: ReviewState;
  rating: ReviewRating;
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  lapseCount: number;
  reviewedAt: Date;
}>;

export type ReviewSchedule = Readonly<{
  state: ReviewState;
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  lapseCount: number;
  dueAt: Date;
}>;

const DAY_MS = 86_400_000;

export function scheduleReview(input: ReviewScheduleInput): ReviewSchedule {
  const currentInterval = Math.max(0, Math.round(input.intervalDays));
  const currentEase = Math.min(300, Math.max(130, Math.round(input.easeFactor)));

  if (input.rating === "again") {
    return {
      state: "learning",
      intervalDays: 0,
      easeFactor: Math.max(130, currentEase - 20),
      repetitionCount: 0,
      lapseCount: input.lapseCount + 1,
      dueAt: new Date(input.reviewedAt.getTime() + 10 * 60_000),
    };
  }

  const firstReview = input.state === "new" || input.state === "learning";
  const multiplier = input.rating === "hard" ? 1.2 : input.rating === "good" ? currentEase / 100 : (currentEase + 50) / 100;
  const intervalDays = firstReview
    ? input.rating === "hard" ? 1 : input.rating === "good" ? 2 : 4
    : Math.max(currentInterval + 1, Math.round(currentInterval * multiplier));
  const repetitionCount = input.repetitionCount + 1;
  const nextState: ReviewState = repetitionCount >= 4 && input.rating === "easy" ? "mastered" : "review";

  return {
    state: nextState,
    intervalDays,
    easeFactor: input.rating === "hard" ? Math.max(130, currentEase - 15) : input.rating === "easy" ? Math.min(300, currentEase + 15) : currentEase,
    repetitionCount,
    lapseCount: input.lapseCount,
    dueAt: new Date(input.reviewedAt.getTime() + intervalDays * DAY_MS),
  };
}
