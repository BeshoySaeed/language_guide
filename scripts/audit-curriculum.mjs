import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const LEVELS = ["A1", "A2", "B1"];
const TARGETS = {
  A1: { vocabulary: 1000, sentences: 300, readingWordsPerLesson: 80, phase: "10.6" },
  A2: { vocabulary: 1200, sentences: 300, readingWordsPerLesson: 150, phase: "10.7" },
  B1: { vocabulary: 1200, sentences: 300, readingWordsPerLesson: 250, phase: "10.8" },
};

const contentRoot = resolve(process.cwd(), "content/languages/de");
const entries = await readdir(contentRoot, { recursive: true, withFileTypes: true });
const paths = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
  .map((entry) => resolve(entry.parentPath, entry.name))
  .sort();
const books = await Promise.all(paths.map(async (path) => JSON.parse(await readFile(path, "utf8"))));
const { getGermanLevelAssessment } = await import("../infrastructure/catalog/level-assessment.ts");

const lowerLevelVocabulary = new Set();
const rows = LEVELS.map((level) => {
  const levelBooks = books.filter((book) => book.levelCode === level);
  const chapters = levelBooks.flatMap((book) => book.chapters);
  const lessons = chapters.flatMap((chapter) => chapter.lessons);
  const allVocabulary = [...lessons.flatMap((lesson) => lesson.vocabulary), ...levelBooks.flatMap((book) => book.coreVocabulary ?? [])];
  const vocabulary = allVocabulary.filter((item) => item.languageFeatures?.qualityStatus !== "quarantined");
  const quarantinedVocabulary = allVocabulary.length - vocabulary.length;
  const distinctVocabulary = new Set(vocabulary.map((item) => normalize(item.lemma)));
  const newVocabulary = [...distinctVocabulary].filter((lemma) => !lowerLevelVocabulary.has(lemma));
  const repeatedFromLowerLevels = distinctVocabulary.size - newVocabulary.length;
  for (const lemma of distinctVocabulary) lowerLevelVocabulary.add(lemma);
  const sentences = lessons.flatMap((lesson) => lesson.sentences);
  const grammarTopics = new Set(lessons.map((lesson) => lesson.grammar.id)).size;
  const readingWords = lessons.reduce((total, lesson) => total + lesson.reading.lines.reduce((lineTotal, line) => lineTotal + line.text.trim().split(/\s+/u).length, 0), 0);
  const readingWordsPerLesson = lessons.length ? Math.round(readingWords / lessons.length) : 0;
  const lessonQuestions = lessons.reduce((total, lesson) => total + lesson.practice.questions.length + lesson.quiz.questions.length, 0);
  const levelTestQuestions = getGermanLevelAssessment(level).questions.length;
  const internallyReviewed = levelBooks.length > 0 && levelBooks.every((book) => book.status === "reviewed" && book.provenance?.reviewedBy && book.provenance?.reviewedAt);
  const nativeReviewed = levelBooks.length > 0 && levelBooks.every((book) => book.provenance?.nativeReview?.status === "approved");
  const target = TARGETS[level];
  const contentTargetReached = newVocabulary.length >= target.vocabulary
    && sentences.length >= target.sentences
    && readingWordsPerLesson >= target.readingWordsPerLesson;

  return {
    level,
    phase: target.phase,
    chapters: chapters.length,
    lessons: lessons.length,
    vocabulary: newVocabulary.length,
    publishedVocabulary: vocabulary.length,
    repeatedFromLowerLevels,
    vocabularyTarget: target.vocabulary,
    quarantinedVocabulary,
    sentences: sentences.length,
    sentenceTarget: target.sentences,
    grammarTopics,
    readingWordsPerLesson,
    readingWordsTarget: target.readingWordsPerLesson,
    lessonQuestions,
    levelTestQuestions,
    internallyReviewed: Boolean(internallyReviewed),
    nativeReviewed,
    contentTargetReached,
  };
});

const pilotPath = resolve(process.cwd(), "quality/a1-learner-pilot-results.json");
let pilot = { status: "not_recorded", participants: 0, completedParticipants: 0 };
try {
  pilot = JSON.parse(await readFile(pilotPath, "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
const pilotCoveragePassed = pilot.coverage && Object.values(pilot.coverage).length >= 7 && Object.values(pilot.coverage).every(Boolean);
const pilotPassed = pilot.status === "passed"
  && Number.isInteger(pilot.participants)
  && pilot.participants >= 10
  && pilot.completedParticipants === pilot.participants
  && Array.isArray(pilot.participantResults)
  && pilot.participantResults.length === pilot.participants
  && pilot.readyForA2Participants / pilot.participants >= 0.8
  && pilot.openCriticalFindings === 0
  && pilot.openHighFindings === 0
  && pilotCoveragePassed
  && pilot.signedByPilotLead === true;

console.log("German A1-B1 curriculum audit");
console.log("Vocabulary targets count distinct items newly introduced at each level; repeated lower-level items and quarantined cards do not satisfy release gates. Reading depth is the average German word count per lesson.\n");
console.table(rows.map((row) => ({
  phase: row.phase,
  level: row.level,
  chapters: row.chapters,
  lessons: row.lessons,
  vocabulary: `${row.vocabulary}/${row.vocabularyTarget}`,
  repeated: row.repeatedFromLowerLevels,
  quarantined: row.quarantinedVocabulary,
  sentences: `${row.sentences}/${row.sentenceTarget}`,
  grammar: row.grammarTopics,
  "reading words": `${row.readingWordsPerLesson}/${row.readingWordsTarget}`,
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

function normalize(value) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("de-DE");
}
