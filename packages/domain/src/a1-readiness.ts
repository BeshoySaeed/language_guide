import type { LevelAssessmentSkill } from "./level-assessment.ts";

export type A1ReadinessInput = Readonly<{
  requiredLessonIds: readonly string[];
  lessonProgress: readonly Readonly<{ lessonId: string; state: "not_started" | "in_progress" | "completed"; bestScore: number }>[];
  assessment: Readonly<{
    percent: number;
    passed: boolean;
    skills: readonly Readonly<{ skill: LevelAssessmentSkill; percent: number }>[];
  }> | null;
  dueReviewCount: number;
}>;

export type A1Readiness = Readonly<{
  ready: boolean;
  completedLessons: number;
  requiredLessons: number;
  masteredLessons: number;
  assessmentPercent: number | null;
  weakSkills: readonly LevelAssessmentSkill[];
  dueReviewCount: number;
  requirements: readonly Readonly<{ id: "lessons" | "quiz_mastery" | "final_assessment" | "skill_floor" | "review"; label: string; met: boolean }>[];
  nextAction: "continue_lessons" | "strengthen_quizzes" | "take_assessment" | "review_skills" | "clear_review" | "start_a2";
  reviewLessonIds: readonly string[];
}>;

export function evaluateA1Readiness(input: A1ReadinessInput): A1Readiness {
  const progress = new Map(input.lessonProgress.map((item) => [item.lessonId, item]));
  const requiredRows = input.requiredLessonIds.map((lessonId) => progress.get(lessonId));
  const completedLessons = requiredRows.filter((item) => item?.state === "completed").length;
  const masteredLessons = requiredRows.filter((item) => item?.state === "completed" && item.bestScore >= 80).length;
  const weakSkills = input.assessment?.skills.filter((skill) => skill.percent < 70).map((skill) => skill.skill) ?? [];
  const lessonsMet = completedLessons === input.requiredLessonIds.length;
  const masteryMet = masteredLessons === input.requiredLessonIds.length;
  const assessmentMet = Boolean(input.assessment?.passed && input.assessment.percent >= 80);
  const skillFloorMet = Boolean(input.assessment && input.assessment.skills.length === 7 && weakSkills.length === 0);
  const reviewMet = input.dueReviewCount === 0;
  const requirements = [
    { id: "lessons" as const, label: "Complete every required A1 lesson", met: lessonsMet },
    { id: "quiz_mastery" as const, label: "Score at least 80% on every lesson quiz", met: masteryMet },
    { id: "final_assessment" as const, label: "Score at least 80% overall on the A1 final", met: assessmentMet },
    { id: "skill_floor" as const, label: "Reach at least 70% in all seven skills", met: skillFloorMet },
    { id: "review" as const, label: "Clear the due review queue", met: reviewMet },
  ];
  const nextAction = !lessonsMet ? "continue_lessons"
    : !masteryMet ? "strengthen_quizzes"
      : !input.assessment ? "take_assessment"
        : !(assessmentMet && skillFloorMet) ? "review_skills"
          : !reviewMet ? "clear_review"
            : "start_a2";
  return {
    ready: requirements.every((requirement) => requirement.met),
    completedLessons,
    requiredLessons: input.requiredLessonIds.length,
    masteredLessons,
    assessmentPercent: input.assessment?.percent ?? null,
    weakSkills,
    dueReviewCount: input.dueReviewCount,
    requirements,
    nextAction,
    reviewLessonIds: input.requiredLessonIds.filter((lessonId) => {
      const row = progress.get(lessonId);
      return !row || row.state !== "completed" || row.bestScore < 80;
    }).slice(0, 3),
  };
}
