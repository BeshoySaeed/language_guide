import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const a1Path = resolve(process.cwd(), "content/languages/de/A1/books/everyday-essentials.json");
const a2Path = resolve(process.cwd(), "content/languages/de/A2/books/everyday-connections.json");
const [a1, a2] = await Promise.all([a1Path, a2Path].map(async (path) => JSON.parse(await readFile(path, "utf8"))));
const a2Lessons = a2.chapters.flatMap((chapter) => chapter.lessons);
const a2LessonVocabulary = a2Lessons.flatMap((lesson) => lesson.vocabulary);
const sourceVocabulary = [
  ...a1.chapters.flatMap((chapter) => chapter.lessons.flatMap((lesson) => lesson.vocabulary)),
  ...(a1.coreVocabulary ?? []),
  ...a2LessonVocabulary,
];
const targetCoreCount = 1200 - a2LessonVocabulary.length;
const existingLemmas = new Set(a2LessonVocabulary.map((item) => normalize(item.lemma)));
const categories = new Map([
  ["case_for", []],
  ["case_context", []],
  ["verb_frame", []],
  ["description", []],
  ["sentence_chunk", []],
]);

function add(category, lemma, translation, partOfSpeech, topic, sourceLessonId) {
  const normalized = normalize(lemma);
  if (!lemma || existingLemmas.has(normalized) || [...categories.values()].some((items) => items.some((item) => normalize(item.lemma) === normalized))) return;
  categories.get(category).push({ lemma, translation, partOfSpeech, topic, sourceLessonId });
}

for (const item of sourceVocabulary) {
  const lemma = item.lemma.trim();
  const part = item.partOfSpeech.toLowerCase();
  const noun = lemma.match(/^(der|die|das)\s+(.+)$/i);
  if (noun && part.includes("noun")) {
    const [, article, body] = noun;
    const accusative = article.toLowerCase() === "der" ? "den" : article.toLowerCase();
    add("case_for", "für " + accusative + " " + body, "for the " + withoutLeadingArticle(item.translation), "case chunk", "Accusative after für", "lesson_de_a2_cases_prepositions");
    if (article.toLowerCase() === "der" || article.toLowerCase() === "das") {
      add("case_context", "mit dem " + body, "with the " + withoutLeadingArticle(item.translation), "case chunk", "Dative after mit", "lesson_de_a2_cases_prepositions");
    } else {
      add("case_context", "ohne die " + body, "without the " + withoutLeadingArticle(item.translation), "case chunk", "Accusative after ohne", "lesson_de_a2_cases_prepositions");
    }
  }
  if ((part.includes("verb") || part === "infinitive") && /^[a-zäöüß]+(?:en|ern|eln)$/iu.test(lemma) && !lemma.startsWith("sich ")) {
    add("verb_frame", "um " + lemma + " zu können", "in order to be able " + infinitiveEnglish(item.translation), "infinitive frame", "Purpose with um ... zu", "lesson_de_a2_moving");
  }
  if (part.includes("adjective") && /^[a-zäöüß]+$/iu.test(lemma)) {
    add("description", "besonders " + lemma, "particularly " + withoutLeadingTo(item.translation), "descriptive chunk", "Degree and description", "lesson_de_a2_adjectives");
  }
}

for (const lesson of a2Lessons) {
  for (const sentence of lesson.sentences) {
    add("sentence_chunk", sentence.text, sentence.translation, "useful sentence", lesson.title, lesson.id);
  }
}

const selected = [];
const names = [...categories.keys()];
let cursor = 0;
while (selected.length < targetCoreCount) {
  let added = false;
  for (let offset = 0; offset < names.length && selected.length < targetCoreCount; offset += 1) {
    const name = names[(cursor + offset) % names.length];
    const item = categories.get(name).shift();
    if (item) {
      selected.push(item);
      added = true;
    }
  }
  cursor = (cursor + 1) % names.length;
  if (!added) break;
}

if (selected.length !== targetCoreCount) {
  const available = [...categories.values()].reduce((total, items) => total + items.length, 0) + selected.length;
  throw new Error("A2 core vocabulary needs " + targetCoreCount + " cards but only " + available + " unique candidates were available.");
}

a2.coreVocabulary = selected.map((item, index) => ({
  id: "vocab_de_a2_core_" + String(index + 1).padStart(4, "0"),
  lemma: item.lemma,
  translation: item.translation,
  pronunciation: "audio",
  partOfSpeech: item.partOfSpeech,
  languageFeatures: { coreVocabulary: true, topic: item.topic },
  sourceLessonId: item.sourceLessonId,
}));
a2.revision = Math.max(a2.revision, 3);
await writeFile(a2Path, JSON.stringify(a2, null, 2) + "\n", "utf8");
console.log("A2 core word bank contains " + a2.coreVocabulary.length + " cards; total A2 vocabulary is " + (a2.coreVocabulary.length + a2LessonVocabulary.length) + ".");

function normalize(value) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("de-DE");
}

function withoutLeadingArticle(value) {
  return value.replace(/^(a|an|the)\s+/i, "");
}

function withoutLeadingTo(value) {
  return value.replace(/^to\s+/i, "");
}

function infinitiveEnglish(value) {
  const cleaned = withoutLeadingTo(value).split(/\s*\/\s*/)[0];
  return "to " + cleaned;
}
