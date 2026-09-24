import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const paths = {
  A1: resolve(process.cwd(), "content/languages/de/A1/books/everyday-essentials.json"),
  A2: resolve(process.cwd(), "content/languages/de/A2/books/everyday-connections.json"),
  B1: resolve(process.cwd(), "content/languages/de/B1/books/independent-life.json"),
};
const [a1, a2, b1] = await Promise.all(Object.values(paths).map(async (path) => JSON.parse(await readFile(path, "utf8"))));
const b1Lessons = b1.chapters.flatMap((chapter) => chapter.lessons);
const b1LessonVocabulary = b1Lessons.flatMap((lesson) => lesson.vocabulary);
const sourceVocabulary = [a1, a2, b1].flatMap((book) => [
  ...book.chapters.flatMap((chapter) => chapter.lessons.flatMap((lesson) => lesson.vocabulary)),
  ...(book.coreVocabulary ?? []),
]);
const targetCoreCount = 1200 - b1LessonVocabulary.length;
const existingLemmas = new Set(b1LessonVocabulary.map((item) => normalize(item.lemma)));
const categories = new Map([
  ["formal_reference", []],
  ["formal_focus", []],
  ["verb_frame", []],
  ["description", []],
  ["sentence_chunk", []],
]);
const candidateLemmas = new Set();

function add(category, lemma, translation, partOfSpeech, topic, sourceLessonId) {
  const normalized = normalize(lemma);
  if (!lemma || existingLemmas.has(normalized) || candidateLemmas.has(normalized)) return;
  candidateLemmas.add(normalized);
  categories.get(category).push({ lemma, translation, partOfSpeech, topic, sourceLessonId });
}

for (const item of sourceVocabulary) {
  const lemma = item.lemma.trim();
  const part = item.partOfSpeech.toLowerCase();
  const noun = lemma.match(/^(der|die|das)\s+(.+)$/i);
  if (noun && part.includes("noun")) {
    const [, article, body] = noun;
    const accusative = article.toLowerCase() === "der" ? "den" : article.toLowerCase();
    const english = withoutLeadingArticle(item.translation);
    add("formal_reference", "in Bezug auf " + accusative + " " + body, "with reference to the " + english, "formal noun chunk", "Formal reference", "lesson_de_b1_verb_preposition_precision");
    add("formal_focus", "im Hinblick auf " + accusative + " " + body, "with regard to the " + english, "formal noun chunk", "Formal focus", "lesson_de_b1_verb_preposition_precision");
  }
  if ((part.includes("verb") || part === "infinitive") && /^[a-zäöüß]+(?:en|ern|eln)$/iu.test(lemma) && !lemma.startsWith("sich ")) {
    add("verb_frame", "ohne " + lemma + " zu können", "without being able " + infinitiveEnglish(item.translation), "infinitive frame", "Concession and limitation", "lesson_de_b1_complex_clauses");
  }
  if (part.includes("adjective") && /^[a-zäöüß]+$/iu.test(lemma)) {
    add("description", "äußerst " + lemma, "extremely " + withoutLeadingTo(item.translation), "descriptive chunk", "Nuanced description", "lesson_de_b1_structured_writing");
  }
}

for (const lesson of b1Lessons) {
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
  throw new Error("B1 core vocabulary needs " + targetCoreCount + " cards but only " + available + " unique candidates were available.");
}

b1.coreVocabulary = selected.map((item, index) => ({
  id: "vocab_de_b1_core_" + String(index + 1).padStart(4, "0"),
  lemma: item.lemma,
  translation: item.translation,
  pronunciation: "audio",
  partOfSpeech: item.partOfSpeech,
  languageFeatures: { coreVocabulary: true, topic: item.topic },
  sourceLessonId: item.sourceLessonId,
}));
b1.revision = Math.max(b1.revision, 6);
await writeFile(paths.B1, JSON.stringify(b1, null, 2) + "\n", "utf8");
console.log("B1 core word bank contains " + b1.coreVocabulary.length + " cards; total B1 vocabulary is " + (b1.coreVocabulary.length + b1LessonVocabulary.length) + ".");

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
  return "to " + withoutLeadingTo(value).split(/\s*\/\s*/)[0];
}
