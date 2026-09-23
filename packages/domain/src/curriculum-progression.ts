export type LessonProgressSnapshot = Readonly<{
  lessonId: string;
  state: "not_started" | "in_progress" | "completed";
  percent: number;
}>;

export type LessonAccess = Readonly<{
  lessonId: string;
  prerequisiteLessonId: string | null;
  completed: boolean;
  started: boolean;
  unlocked: boolean;
  recommended: boolean;
}>;

export function calculateLessonAccess(
  lessonIds: readonly string[],
  progress: readonly LessonProgressSnapshot[],
  enforcePrerequisites: boolean,
): readonly LessonAccess[] {
  const progressByLesson = new Map(progress.map((item) => [item.lessonId, item]));
  const initial = lessonIds.map((lessonId, index) => {
    const saved = progressByLesson.get(lessonId);
    const completed = saved?.state === "completed";
    const started = Boolean(saved && (saved.state === "in_progress" || saved.percent > 0));
    const prerequisiteLessonId = index > 0 ? lessonIds[index - 1] : null;
    const prerequisiteCompleted = !prerequisiteLessonId || progressByLesson.get(prerequisiteLessonId)?.state === "completed";
    return {
      lessonId,
      prerequisiteLessonId,
      completed,
      started,
      unlocked: !enforcePrerequisites || completed || started || prerequisiteCompleted,
      recommended: false,
    };
  });
  const recommendedId = initial.find((item) => item.unlocked && !item.completed)?.lessonId;
  return initial.map((item) => ({ ...item, recommended: item.lessonId === recommendedId }));
}

export function courseCompletionPercent(access: readonly LessonAccess[]): number {
  if (!access.length) return 0;
  return Math.round((access.filter((item) => item.completed).length / access.length) * 100);
}
