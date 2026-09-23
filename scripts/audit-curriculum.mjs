import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const LEVELS = ["A1", "A2", "B1"];
const TARGETS = {
  A1: { vocabulary: 1000, sentences: 300, phase: "10.6" },
  A2: { vocabulary: 1200, sentences: 300, phase: "10.7" },
  B1: { vocabulary: 1200, sentences: 300, phase: "10.8" },
};

const contentRoot = resolve(process.cwd(), "content/languages/de");
const entries = await readdir(contentRoot, { recursive: true, withFileTypes: true });
const paths = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
  .map((entry) => resolve(entry.parentPath, entry.name))
  .sort();
const books = await Promise.all(paths.map(async (path) => JSON.parse(await readFile(path, "utf8"))));
const { getGermanLevelAssessment } = await import("../infrastructure/catalog/level-assessment.ts");

const rows = LEVELS.map((level) => {
  const levelBooks = books.filter((book) => book.levelCode === level);
  const chapters = levelBooks.flatMap((book) => book.chapters);
  const lessons = chapters.flatMap((chapter) => chapter.lessons);
  const vocabulary = [...lessons.flatMap((lesson) => lesson.vocabulary), ...levelBooks.flatMap((book) => book.coreVocabulary ?? [])];
  const sentences = lessons.flatMap((lesson) => lesson.sentences);
  const grammarTopics = new Set(lessons.map((lesson) => lesson.grammar.id)).size;
  const lessonQuestions = lessons.reduce((total, lesson) => total + lesson.practice.questions.length + lesson.quiz.questions.length, 0);
  const levelTestQuestions = getGermanLevelAssessment(level).questions.length;
  const internallyReviewed = levelBooks.length > 0 && levelBooks.every((book) => book.status === "reviewed" && book.provenance?.reviewedBy && book.provenance?.reviewedAt);
  const nativeReviewed = levelBooks.length > 0 && levelBooks.every((book) => book.provenance?.nativeReview?.status === "approved");
  const target = TARGETS[level];
  const contentTargetReached = vocabulary.length >= target.vocabulary && sentences.length >= target.sentences;

  return {
    level,
    phase: target.phase,
    chapters: chapters.length,
    lessons: lessons.length,
    vocabulary: vocabulary.length,
    vocabularyTarget: target.vocabulary,
    sentences: sentences.length,
    sentenceTarget: target.sentences,
    grammarTopics,
    lessonQuestions,
    levelTestQuestions,
    internallyReviewed: Boolean(internallyReviewed),
    nativeReviewed,
    contentTargetReached,
  };
});

const pilotPath = resolve(process.cwd(), "quality/learner-pilot-results.json");
let pilot = { status: "not_recorded", participants: 0, completedParticipants: 0 };
try {
  pilot = JSON.parse(await readFile(pilotPath, "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
const pilotPassed = pilot.status === "passed" && Number.isInteger(pilot.participants) && pilot.participants >= 10 && pilot.completedParticipants === pilot.participants;

console.log("German A1-B1 curriculum audit");
console.log("Counts use authored vocabulary cards and useful-sentence cards; targets are release gates, not estimates.\n");
console.table(rows.map((row) => ({
  phase: row.phase,
  level: row.level,
  chapters: row.chapters,
  lessons: row.lessons,
  vocabulary: `${row.vocabulary}/${row.vocabularyTarget}`,
  sentences: `${row.sentences}/${row.sentenceTarget}`,
  grammar: row.grammarTopics,
  "lesson Qs": row.lessonQuestions,
  "level-test Qs": row.levelTestQuestions,
  "internal review": row.internallyReviewed ? "pass" : "pending",
  "native review": row.nativeReviewed ? "pass" : "pending",
  "content gate": row.contentTargetReached ? "pass" : "in progress",
})));

const contentComplete = rows.every((row) => row.contentTargetReached && row.internallyReviewed && row.levelTestQuestions >= 15);
const nativeReviewComplete = rows.every((row) => row.nativeReviewed);
console.log(`Phase 10.6-10.8 curriculum gate: ${contentComplete ? "PASS" : "IN PROGRESS"}`);
console.log(`Phase 10.9 native-speaker review: ${nativeReviewComplete ? "PASS" : "PENDING REAL REVIEW"}`);
console.log(`Phase 10.9 learner pilot: ${pilotPassed ? "PASS" : `PENDING (${pilot.completedParticipants ?? 0}/${pilot.participants ?? 0} recorded completions)`}`);

if (process.argv.includes("--strict") && !(contentComplete && nativeReviewComplete && pilotPassed)) {
  process.exitCode = 1;
}
