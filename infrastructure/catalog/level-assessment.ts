import { getGermanCourse, type GermanLevel } from "./lesson-content.ts";
import { generateLevelAssessment, toPublicLevelAssessment } from "../../packages/domain/src/level-assessment.ts";

const assessmentCache = new Map<GermanLevel, ReturnType<typeof generateLevelAssessment>>();
const publicAssessmentCache = new Map<GermanLevel, ReturnType<typeof toPublicLevelAssessment>>();

export function getGermanLevelAssessment(levelCode: GermanLevel) {
  const cached = assessmentCache.get(levelCode);
  if (cached) return cached;
  const course = getGermanCourse(levelCode);
  const assessment = generateLevelAssessment(levelCode, course.chapters.flatMap((chapter) => chapter.lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    vocabulary: lesson.vocabulary,
    sentences: lesson.sentences,
    questions: lesson.quiz.questions,
  }))));
  assessmentCache.set(levelCode, assessment);
  return assessment;
}

export function getPublicGermanLevelAssessment(levelCode: GermanLevel) {
  const cached = publicAssessmentCache.get(levelCode);
  if (cached) return cached;
  const assessment = toPublicLevelAssessment(getGermanLevelAssessment(levelCode));
  publicAssessmentCache.set(levelCode, assessment);
  return assessment;
}
