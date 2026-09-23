import { getGermanCourse, type GermanLevel } from "./lesson-content.ts";
import { generateLevelAssessment, toPublicLevelAssessment } from "../../packages/domain/src/level-assessment.ts";

export function getGermanLevelAssessment(levelCode: GermanLevel) {
  const course = getGermanCourse(levelCode);
  return generateLevelAssessment(levelCode, course.chapters.flatMap((chapter) => chapter.lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    vocabulary: lesson.vocabulary,
    sentences: lesson.sentences,
    questions: lesson.quiz.questions,
  }))));
}

export function getPublicGermanLevelAssessment(levelCode: GermanLevel) {
  return toPublicLevelAssessment(getGermanLevelAssessment(levelCode));
}
