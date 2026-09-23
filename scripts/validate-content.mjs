import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";

const questionSchema = z.object({
  id: z.string().min(4),
  type: z.literal("multiple_choice"),
  instruction: z.string().min(5),
  prompt: z.string().min(1),
  choices: z.array(z.string().min(1)).length(3),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(5),
  skill: z.enum(["vocabulary", "grammar", "reading"]),
});

const lessonSchema = z.object({
  id: z.string().startsWith("lesson_"),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(3),
  summary: z.string().min(12),
  heroTitle: z.string().min(8),
  completionTitle: z.string().min(8),
  estimatedMinutes: z.number().int().min(5).max(30),
  status: z.literal("published"),
  revision: z.number().int().positive(),
  objectives: z.array(z.string().min(8)).length(3),
  vocabulary: z.array(z.object({ id: z.string().startsWith("vocab_"), lemma: z.string().min(1), translation: z.string().min(1), pronunciation: z.string().min(1), partOfSpeech: z.string().min(2), languageFeatures: z.record(z.unknown()) })).min(5),
  sentences: z.array(z.object({ id: z.string().startsWith("sentence_"), text: z.string().min(2), translation: z.string().min(2), note: z.string().min(5) })).min(4),
  grammar: z.object({ id: z.string().startsWith("grammar_"), title: z.string().min(4), explanation: z.string().min(20), pattern: z.string().min(5), examples: z.array(z.object({ source: z.string().min(2), translation: z.string().min(2) })).min(2), commonMistake: z.string().min(12) }),
  reading: z.object({ id: z.string().startsWith("reading_"), title: z.string().min(4), lines: z.array(z.object({ speaker: z.string().min(1), text: z.string().min(2), translation: z.string().min(2) })).min(4) }),
  practice: z.object({ id: z.string().startsWith("practice_"), passThreshold: z.number().int().min(50).max(100), questions: z.array(questionSchema).min(3) }),
  quiz: z.object({ id: z.string().startsWith("quiz_"), title: z.string().min(4), passThreshold: z.number().int().min(50).max(100), questions: z.array(questionSchema).min(5) }),
});

const bookSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().startsWith("book_"),
  languageCode: z.literal("de"),
  levelCode: z.enum(["A1", "A2", "B1"]),
  status: z.literal("reviewed"),
  revision: z.number().int().positive(),
  provenance: z.object({
    author: z.string().min(3),
    reviewedBy: z.string().min(3),
    reviewedAt: z.string().date(),
    nativeReview: z.object({
      reviewer: z.string().min(3),
      locale: z.string().regex(/^de(?:-|$)/i),
      reviewedAt: z.string().date(),
      scope: z.literal("full_book"),
      status: z.literal("approved"),
    }).optional(),
  }),
  chapters: z.array(z.object({
    id: z.string().startsWith("chapter_"),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(3),
    description: z.string().min(12),
    lessons: z.array(lessonSchema).min(1),
  })).min(1),
  coreVocabulary: z.array(z.object({
    id: z.string().startsWith("vocab_"),
    lemma: z.string().min(1),
    translation: z.string().min(1),
    pronunciation: z.string().min(1),
    partOfSpeech: z.string().min(2),
    languageFeatures: z.record(z.unknown()),
    sourceLessonId: z.string().startsWith("lesson_"),
  })).optional(),
}).passthrough();

const contentRoot = resolve(process.cwd(), "content/languages/de");
const entries = await readdir(contentRoot, { recursive: true, withFileTypes: true });
const contentPaths = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
  .map((entry) => resolve(entry.parentPath, entry.name))
  .sort();

const allIds = [];
let lessonCount = 0;
let questionCount = 0;
const levels = new Set();

for (const contentPath of contentPaths) {
  const source = JSON.parse(await readFile(contentPath, "utf8"));
  const result = bookSchema.safeParse(source);
  if (!result.success) {
    console.error(`${contentPath}\n${z.prettifyError(result.error)}`);
    process.exitCode = 1;
    continue;
  }

  levels.add(result.data.levelCode);
  allIds.push(...result.data.chapters.map((chapter) => chapter.id));
  allIds.push(...(result.data.coreVocabulary ?? []).map((item) => item.id));
  const lessonIds = new Set(result.data.chapters.flatMap((chapter) => chapter.lessons.map((lesson) => lesson.id)));
  for (const item of result.data.coreVocabulary ?? []) {
    if (!lessonIds.has(item.sourceLessonId)) throw new Error(`${item.id}: sourceLessonId must identify a lesson in the same book`);
  }
  for (const chapter of result.data.chapters) {
    lessonCount += chapter.lessons.length;
    for (const lesson of chapter.lessons) {
      allIds.push(lesson.id, lesson.grammar.id, lesson.reading.id, lesson.practice.id, lesson.quiz.id);
      allIds.push(...lesson.vocabulary.map((item) => item.id), ...lesson.sentences.map((item) => item.id));
      for (const question of [...lesson.practice.questions, ...lesson.quiz.questions]) {
        allIds.push(question.id);
        questionCount += 1;
        if (!question.choices.includes(question.correctAnswer)) throw new Error(`${question.id}: correctAnswer must be one of choices`);
        if (new Set(question.choices).size !== question.choices.length) throw new Error(`${question.id}: choices must be unique`);
      }
    }
  }
}

const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
if (duplicates.length) throw new Error(`Duplicate content IDs: ${[...new Set(duplicates)].join(", ")}`);
if (["A1", "A2", "B1"].some((level) => !levels.has(level))) throw new Error("German A1, A2, and B1 content are all required.");
if (!process.exitCode) console.log(`Validated ${lessonCount} German lessons across ${levels.size} levels, ${allIds.length} stable content IDs, and ${questionCount} assessment questions.`);
