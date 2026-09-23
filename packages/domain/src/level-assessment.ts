import { gradeAttempt, type SubmittedAnswer } from "./assessment.ts";

export const LEVEL_ASSESSMENT_SKILLS = ["vocabulary", "sentences", "grammar", "reading", "listening", "writing", "speaking"] as const;
export type LevelAssessmentSkill = (typeof LEVEL_ASSESSMENT_SKILLS)[number];

type SourceVocabulary = Readonly<{ id: string; lemma: string; translation: string }>;
type SourceSentence = Readonly<{ id: string; text: string; translation: string }>;
type SourceChoiceQuestion = Readonly<{ id: string; prompt: string; instruction: string; choices: readonly string[]; correctAnswer: string; explanation: string; skill: "vocabulary" | "grammar" | "reading" }>;
type SourceLesson = Readonly<{ id: string; title: string; vocabulary: readonly SourceVocabulary[]; sentences: readonly SourceSentence[]; questions: readonly SourceChoiceQuestion[] }>;

export type LevelAssessmentQuestion = Readonly<{
  id: string;
  skill: LevelAssessmentSkill;
  sourceLessonId: string;
  sourceLessonTitle: string;
  instruction: string;
  prompt: string;
  choices: readonly string[];
  correctAnswer: string;
  explanation: string;
  responseMode: "choice" | "text" | "speech";
  audioText?: string;
}>;

export type LevelAssessment = Readonly<{
  id: string;
  languageCode: "de";
  levelCode: "A1" | "A2" | "B1";
  policyVersion: 1;
  passThreshold: 70 | 80;
  questions: readonly LevelAssessmentQuestion[];
}>;

export type PublicLevelAssessment = Omit<LevelAssessment, "questions"> & {
  questions: readonly Omit<LevelAssessmentQuestion, "correctAnswer" | "explanation">[];
};

export function generateLevelAssessment(levelCode: LevelAssessment["levelCode"], lessons: readonly SourceLesson[]): LevelAssessment {
  if (lessons.length < 3) throw new Error("A level assessment requires at least three lessons.");
  const vocabulary = lessons.flatMap((lesson) => lesson.vocabulary.map((item) => ({ ...item, lesson })));
  const sentences = lessons.flatMap((lesson) => lesson.sentences.map((item) => ({ ...item, lesson })));
  const grammar = lessons.flatMap((lesson) => lesson.questions.filter((question) => question.skill === "grammar").map((question) => ({ ...question, lesson })));
  const reading = lessons.flatMap((lesson) => lesson.questions.filter((question) => question.skill === "reading").map((question) => ({ ...question, lesson })));
  if (vocabulary.length < 6 || sentences.length < 6 || grammar.length < 3 || reading.length < 3) throw new Error("Level assessment source content is incomplete.");

  const vocabularyQuestions = sampleAcross(vocabulary, 3).map((item, index): LevelAssessmentQuestion => ({
    id: `level_test_de_${levelCode.toLowerCase()}_vocabulary_${index + 1}`,
    skill: "vocabulary",
    sourceLessonId: item.lesson.id,
    sourceLessonTitle: item.lesson.title,
    instruction: "Choose the German expression",
    prompt: item.translation,
    choices: choicesFor(item.lemma, vocabulary.map((candidate) => candidate.lemma), index),
    correctAnswer: item.lemma,
    explanation: `${item.lemma} means “${item.translation}.”`,
    responseMode: "choice",
  }));
  const sentenceQuestions = sampleAcross(sentences, 3).map((item, index): LevelAssessmentQuestion => ({
    id: `level_test_de_${levelCode.toLowerCase()}_sentences_${index + 1}`,
    skill: "sentences",
    sourceLessonId: item.lesson.id,
    sourceLessonTitle: item.lesson.title,
    instruction: "Choose the matching German sentence",
    prompt: item.translation,
    choices: choicesFor(item.text, sentences.map((candidate) => candidate.text), index + 2),
    correctAnswer: item.text,
    explanation: `${item.text} — ${item.translation}`,
    responseMode: "choice",
  }));
  const grammarQuestions = sampleAcross(grammar, 3).map((item, index): LevelAssessmentQuestion => ({
    id: `level_test_de_${levelCode.toLowerCase()}_grammar_${index + 1}`,
    skill: "grammar",
    sourceLessonId: item.lesson.id,
    sourceLessonTitle: item.lesson.title,
    instruction: item.instruction,
    prompt: item.prompt,
    choices: item.choices,
    correctAnswer: item.correctAnswer,
    explanation: item.explanation,
    responseMode: "choice",
  }));
  const readingQuestions = sampleAcross(reading, 3).map((item, index): LevelAssessmentQuestion => ({
    id: `level_test_de_${levelCode.toLowerCase()}_reading_${index + 1}`,
    skill: "reading",
    sourceLessonId: item.lesson.id,
    sourceLessonTitle: item.lesson.title,
    instruction: item.instruction,
    prompt: item.prompt,
    choices: item.choices,
    correctAnswer: item.correctAnswer,
    explanation: item.explanation,
    responseMode: "choice",
  }));
  const listeningQuestions = sampleAcross(sentences.slice().reverse(), 3).map((item, index): LevelAssessmentQuestion => ({
    id: `level_test_de_${levelCode.toLowerCase()}_listening_${index + 1}`,
    skill: "listening",
    sourceLessonId: item.lesson.id,
    sourceLessonTitle: item.lesson.title,
    instruction: "Listen, then choose the meaning",
    prompt: `Listening item ${index + 1}`,
    choices: choicesFor(item.translation, sentences.map((candidate) => candidate.translation), index + 4),
    correctAnswer: item.translation,
    explanation: `${item.text} means “${item.translation}.”`,
    responseMode: "choice",
    audioText: item.text,
  }));

  const productionSource = sampleAcross(sentences, 3);
  const writingQuestions = levelCode === "A1" ? productionSource.map((item, index): LevelAssessmentQuestion => ({
    id: `level_test_de_a1_writing_${index + 1}`,
    skill: "writing",
    sourceLessonId: item.lesson.id,
    sourceLessonTitle: item.lesson.title,
    instruction: "Write the complete German sentence",
    prompt: item.translation,
    choices: [],
    correctAnswer: item.text,
    explanation: `Model answer: ${item.text}`,
    responseMode: "text",
  })) : [];
  const speakingQuestions = levelCode === "A1" ? sampleAcross(sentences.slice().reverse(), 3).map((item, index): LevelAssessmentQuestion => ({
    id: `level_test_de_a1_speaking_${index + 1}`,
    skill: "speaking",
    sourceLessonId: item.lesson.id,
    sourceLessonTitle: item.lesson.title,
    instruction: "Say the German sentence aloud",
    prompt: item.translation,
    choices: [],
    correctAnswer: item.text,
    explanation: `Target sentence: ${item.text}`,
    responseMode: "speech",
  })) : [];

  return {
    id: `level-test:de:${levelCode}:v1`,
    languageCode: "de",
    levelCode,
    policyVersion: 1,
    passThreshold: levelCode === "A1" ? 80 : 70,
    questions: [...vocabularyQuestions, ...sentenceQuestions, ...grammarQuestions, ...readingQuestions, ...listeningQuestions, ...writingQuestions, ...speakingQuestions],
  };
}

export function toPublicLevelAssessment(assessment: LevelAssessment): PublicLevelAssessment {
  return {
    ...assessment,
    questions: assessment.questions.map((question) => ({
      id: question.id,
      skill: question.skill,
      sourceLessonId: question.sourceLessonId,
      sourceLessonTitle: question.sourceLessonTitle,
      instruction: question.instruction,
      prompt: question.prompt,
      choices: question.choices,
      responseMode: question.responseMode,
      ...(question.audioText ? { audioText: question.audioText } : {}),
    })),
  };
}

export function gradeLevelAssessment(assessment: LevelAssessment, answers: readonly SubmittedAnswer[]) {
  const grade = gradeAttempt(assessment.questions, answers, assessment.passThreshold);
  const answerById = new Map(grade.answers.map((answer) => [answer.exerciseId, answer]));
  const skills = LEVEL_ASSESSMENT_SKILLS.flatMap((skill) => {
    const questions = assessment.questions.filter((question) => question.skill === skill);
    if (!questions.length) return [];
    const correct = questions.filter((question) => answerById.get(question.id)?.correct).length;
    return [{ skill, correct, total: questions.length, percent: Math.round((correct / questions.length) * 100) }];
  });
  const missedLessons = assessment.questions
    .filter((question) => !answerById.get(question.id)?.correct)
    .reduce((counts, question) => counts.set(question.sourceLessonTitle, (counts.get(question.sourceLessonTitle) ?? 0) + 1), new Map<string, number>());
  const recommendedLessons = [...missedLessons.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).slice(0, 3).map(([title]) => title);
  return {
    ...grade,
    passed: grade.percent >= assessment.passThreshold && skills.every((skill) => skill.percent >= 70),
    skills,
    strongSkills: skills.filter((skill) => skill.percent >= 80).map((skill) => skill.skill),
    weakSkills: skills.filter((skill) => skill.percent < 70).map((skill) => skill.skill),
    recommendedLessons,
  };
}

function sampleAcross<T>(items: readonly T[], count: number): T[] {
  return Array.from({ length: count }, (_, index) => items[Math.floor((index * items.length) / count)]);
}

function choicesFor(correct: string, pool: readonly string[], offset: number): string[] {
  const unique = pool.filter((value, index) => normalize(value) !== normalize(correct) && pool.findIndex((candidate) => normalize(candidate) === normalize(value)) === index);
  const first = unique[offset % unique.length];
  const second = unique[(offset + Math.max(1, Math.floor(unique.length / 2))) % unique.length];
  return rotateUnique([correct, first, second], offset);
}

function rotateUnique(values: readonly string[], offset: number): string[] {
  const unique = values.filter((value, index) => values.findIndex((candidate) => normalize(candidate) === normalize(value)) === index);
  if (unique.length !== 3) throw new Error("Assessment choices must contain three unique values.");
  const shift = offset % unique.length;
  return [...unique.slice(shift), ...unique.slice(0, shift)];
}

function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("de-DE");
}
