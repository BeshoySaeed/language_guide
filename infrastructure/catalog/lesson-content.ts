import a1Source from "../../content/languages/de/A1/books/everyday-essentials.json" with { type: "json" };
import a2Source from "../../content/languages/de/A2/books/everyday-connections.json" with { type: "json" };
import b1Source from "../../content/languages/de/B1/books/independent-life.json" with { type: "json" };
import { generatePracticeChallenge, toPublicPracticeChallenge } from "../../packages/domain/src/practice-challenge.ts";

export const GERMAN_LEVELS = ["A1", "A2", "B1"] as const;
export type GermanLevel = (typeof GERMAN_LEVELS)[number];

export type ChoiceQuestion = Readonly<{
  id: string;
  type: "multiple_choice";
  prompt: string;
  instruction: string;
  choices: readonly string[];
  correctAnswer: string;
  explanation: string;
  skill: "vocabulary" | "grammar" | "reading";
}>;

export type VocabularyItem = Readonly<{
  id: string;
  lemma: string;
  translation: string;
  pronunciation: string;
  partOfSpeech: string;
  languageFeatures: Readonly<Record<string, string | boolean>>;
}>;

export type AuthoredLesson = Readonly<{
  id: string;
  slug: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  status: "published";
  revision: number;
  heroTitle: string;
  completionTitle: string;
  objectives: readonly string[];
  vocabulary: readonly VocabularyItem[];
  sentences: readonly Readonly<{ id: string; text: string; translation: string; note: string }>[];
  grammar: Readonly<{
    id: string;
    title: string;
    explanation: string;
    pattern: string;
    examples: readonly Readonly<{ source: string; translation: string }>[];
    commonMistake: string;
  }>;
  reading: Readonly<{
    id: string;
    title: string;
    lines: readonly Readonly<{ speaker: string; text: string; translation: string }>[];
  }>;
  practice: Readonly<{ id: string; passThreshold: number; questions: readonly ChoiceQuestion[] }>;
  quiz: Readonly<{ id: string; title: string; passThreshold: number; questions: readonly ChoiceQuestion[] }>;
}>;

export type AuthoredChapter = Readonly<{
  id: string;
  slug: string;
  title: string;
  description: string;
  lessons: readonly AuthoredLesson[];
}>;

export type AuthoredBook = Readonly<{
  schemaVersion: 1;
  id: string;
  languageCode: "de";
  levelCode: GermanLevel;
  slug: string;
  title: string;
  description: string;
  status: "reviewed";
  revision: number;
  provenance: Readonly<{
    author: string;
    reviewedBy: string;
    reviewedAt: string;
    nativeReview?: Readonly<{
      reviewer: string;
      locale: string;
      reviewedAt: string;
      scope: "full_book";
      status: "approved";
    }>;
  }>;
  chapters: readonly AuthoredChapter[];
  coreVocabulary?: readonly (VocabularyItem & Readonly<{ sourceLessonId: string }>)[];
}>;

export type PublicChoiceQuestion = Omit<ChoiceQuestion, "correctAnswer" | "explanation">;
export type PublicLesson = Omit<AuthoredLesson, "practice" | "quiz"> & {
  languageCode: "de";
  levelCode: GermanLevel;
  bookTitle: string;
  chapterId: string;
  chapterTitle: string;
  chapterOrder: number;
  chapterLessonOrder: number;
  order: number;
  practice: { id: string; passThreshold: number; questions: readonly PublicChoiceQuestion[] };
  quiz: { id: string; title: string; passThreshold: number; questions: readonly PublicChoiceQuestion[] };
};

const germanCourses = [a1Source, a2Source, b1Source] as unknown as readonly AuthoredBook[];

export const everydayEssentials = germanCourses[0];

export function isGermanLevel(value: string): value is GermanLevel {
  return GERMAN_LEVELS.includes(value as GermanLevel);
}

export function getGermanCourse(levelCode: GermanLevel): AuthoredBook {
  const course = germanCourses.find((candidate) => candidate.levelCode === levelCode);
  if (!course) throw new Error(`German ${levelCode} content is not configured.`);
  return course;
}

export function listGermanCourses(): readonly AuthoredBook[] {
  return germanCourses;
}

export function getLessonContextById(lessonId: string) {
  for (const book of germanCourses) {
    let courseOffset = 0;
    for (const [chapterIndex, chapter] of book.chapters.entries()) {
      const lessonIndex = chapter.lessons.findIndex((lesson) => lesson.id === lessonId);
      if (lessonIndex >= 0) {
        return {
          lesson: chapter.lessons[lessonIndex],
          book,
          chapter,
          order: courseOffset + lessonIndex + 1,
          chapterOrder: chapterIndex + 1,
          chapterLessonOrder: lessonIndex + 1,
        };
      }
      courseOffset += chapter.lessons.length;
    }
  }
  return undefined;
}

export function getLessonById(lessonId: string): AuthoredLesson | undefined {
  return getLessonContextById(lessonId)?.lesson;
}

export function getLessonBySlug(levelCode: GermanLevel, slug: string): AuthoredLesson | undefined {
  return getGermanCourse(levelCode).chapters.flatMap((chapter) => chapter.lessons).find((lesson) => lesson.slug === slug);
}

export function getVocabularyById(contentItemId: string) {
  for (const book of germanCourses) {
    const coreVocabulary = book.coreVocabulary?.find((item) => item.id === contentItemId);
    if (coreVocabulary) {
      const lesson = getLessonById(coreVocabulary.sourceLessonId);
      if (lesson) return { vocabulary: coreVocabulary, lesson, languageCode: book.languageCode, levelCode: book.levelCode };
    }
    for (const chapter of book.chapters) {
      for (const lesson of chapter.lessons) {
        const vocabulary = lesson.vocabulary.find((item) => item.id === contentItemId);
        if (vocabulary) return { vocabulary, lesson, languageCode: book.languageCode, levelCode: book.levelCode };
      }
    }
  }
  return undefined;
}

export function listVocabulary(levelCode?: GermanLevel) {
  const books = levelCode ? [getGermanCourse(levelCode)] : germanCourses;
  return books.flatMap((book) => {
    const lessonItems = book.chapters.flatMap((chapter) => chapter.lessons.flatMap((lesson) => lesson.vocabulary.map((vocabulary) => ({ vocabulary, lesson, levelCode: book.levelCode }))));
    const coreItems = (book.coreVocabulary ?? []).flatMap((vocabulary) => {
      const lesson = getLessonById(vocabulary.sourceLessonId);
      return lesson ? [{ vocabulary, lesson, levelCode: book.levelCode }] : [];
    });
    return [...lessonItems, ...coreItems];
  });
}

export function getPracticeChallenge(seed: string, levelCode: GermanLevel = "A1") {
  const course = getGermanCourse(levelCode);
  return generatePracticeChallenge({
    vocabulary: listVocabulary(levelCode).map(({ vocabulary }) => ({ id: vocabulary.id, lemma: vocabulary.lemma, translation: vocabulary.translation })),
    sentences: course.chapters.flatMap((chapter) => chapter.lessons.flatMap((lesson) => lesson.sentences.map((sentence) => ({ id: sentence.id, text: sentence.text, translation: sentence.translation })))),
  }, seed, levelCode);
}

export function getPublicPracticeChallenge(seed: string, levelCode: GermanLevel = "A1") {
  return toPublicPracticeChallenge(getPracticeChallenge(seed, levelCode));
}

export function getPublicLessonBySlug(levelCode: GermanLevel, slug: string): PublicLesson | undefined {
  const book = getGermanCourse(levelCode);
  const lessons = listBookLessonContexts(book);
  const context = lessons.find((candidate) => candidate.lesson.slug === slug);
  return context ? toPublicLesson(context, book) : undefined;
}

export function listPublicLessons(levelCode: GermanLevel = "A1"): readonly PublicLesson[] {
  const book = getGermanCourse(levelCode);
  return listBookLessonContexts(book).map((context) => toPublicLesson(context, book));
}

export function listAllPublicLessons(): readonly PublicLesson[] {
  return germanCourses.flatMap((book) => listBookLessonContexts(book).map((context) => toPublicLesson(context, book)));
}

export function getAssessmentQuestions(lessonId: string, type: "practice" | "quiz"): readonly ChoiceQuestion[] | undefined {
  const lesson = getLessonById(lessonId);
  if (!lesson) return undefined;
  return type === "practice" ? lesson.practice.questions : lesson.quiz.questions;
}

type BookLessonContext = Readonly<{
  lesson: AuthoredLesson;
  chapter: AuthoredChapter;
  order: number;
  chapterOrder: number;
  chapterLessonOrder: number;
}>;

function listBookLessonContexts(book: AuthoredBook): BookLessonContext[] {
  let order = 0;
  return book.chapters.flatMap((chapter, chapterIndex) => chapter.lessons.map((lesson, lessonIndex) => ({
    lesson,
    chapter,
    order: ++order,
    chapterOrder: chapterIndex + 1,
    chapterLessonOrder: lessonIndex + 1,
  })));
}

function toPublicLesson(context: BookLessonContext, book: AuthoredBook): PublicLesson {
  const { lesson, chapter, order, chapterOrder, chapterLessonOrder } = context;
  const withoutAnswers = (questions: readonly ChoiceQuestion[]): PublicChoiceQuestion[] => questions.map((question) => ({
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    instruction: question.instruction,
    choices: question.choices,
    skill: question.skill,
  }));
  return {
    ...lesson,
    languageCode: book.languageCode,
    levelCode: book.levelCode,
    bookTitle: book.title,
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    chapterOrder,
    chapterLessonOrder,
    order,
    practice: { id: lesson.practice.id, passThreshold: lesson.practice.passThreshold, questions: withoutAnswers(lesson.practice.questions) },
    quiz: { id: lesson.quiz.id, title: lesson.quiz.title, passThreshold: lesson.quiz.passThreshold, questions: withoutAnswers(lesson.quiz.questions) },
  };
}
