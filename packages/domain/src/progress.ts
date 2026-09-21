export type ProgressInput = Readonly<{
  completed: number;
  total: number;
}>;

export function calculateProgress({ completed, total }: ProgressInput): number {
  if (!Number.isFinite(completed) || !Number.isFinite(total) || total <= 0) return 0;
  const boundedCompleted = Math.min(Math.max(completed, 0), total);
  return Math.round((boundedCompleted / total) * 100);
}

export type ReviewState = "new" | "learning" | "review" | "mastered";

export function nextReviewState(
  current: ReviewState,
  rating: "again" | "hard" | "good" | "easy",
): ReviewState {
  if (rating === "again") return "learning";
  if (current === "new") return "learning";
  if (current === "learning" && (rating === "good" || rating === "easy")) return "review";
  if (current === "review" && rating === "easy") return "mastered";
  return current;
}

