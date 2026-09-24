import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export async function upsertB1Chapters(chapterSpecs, revision, reviewedBy) {
  const path = resolve(process.cwd(), "content/languages/de/B1/books/independent-life.json");
  const book = JSON.parse(await readFile(path, "utf8"));
  for (const [key, title, description, lessons] of chapterSpecs) {
    const generated = { id: "chapter_de_b1_" + key, slug: key.replaceAll("_", "-"), title, description, lessons: lessons.map(buildLesson) };
    const index = book.chapters.findIndex((chapter) => chapter.id === generated.id);
    if (index >= 0) book.chapters.splice(index, 1, generated);
    else book.chapters.push(generated);
  }
  book.revision = Math.max(book.revision, revision);
  book.provenance.reviewedBy = reviewedBy;
  book.provenance.reviewedAt = "2026-09-23";
  await writeFile(path, JSON.stringify(book, null, 2) + "\n", "utf8");
  return { chapters: book.chapters.length, lessons: book.chapters.flatMap((chapter) => chapter.lessons).length };
}

function rows(value) {
  return value.split(";").map((row) => row.trim()).filter(Boolean).map((row) => row.split("|"));
}

function idPart(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "").toLowerCase();
}

function choices(correct, alternatives) {
  const values = [correct, ...alternatives].filter((value, index, all) => all.indexOf(value) === index).slice(0, 3);
  if (values.length !== 3) throw new Error("Could not create three choices for " + correct);
  return values;
}

function buildLesson(item) {
  const [key, slug, title, summary, grammarTitle, explanation, pattern, vocabRows, sentenceRows] = item;
  const prefix = "de_b1_" + key;
  const vocabulary = rows(vocabRows).map(([lemma, translation, partOfSpeech], index) => ({
    id: "vocab_" + prefix + "_" + idPart(lemma) + "_" + (index + 1),
    lemma, translation, pronunciation: "audio", partOfSpeech, languageFeatures: {},
  }));
  const sentences = rows(sentenceRows).map(([text, translation], index) => ({
    id: "sentence_" + prefix + "_" + (index + 1), text, translation,
    note: index < 5 ? "Use this as a connected B1 expression." : "Adapt this structure to explain your own position or experience.",
  }));
  const grammarExamples = [sentences[0], sentences[3]].map(({ text: source, translation }) => ({ source, translation }));
  const question = (id, instruction, prompt, answerChoices, correctAnswer, questionExplanation, skill) => ({ id, type: "multiple_choice", instruction, prompt, choices: answerChoices, correctAnswer, explanation: questionExplanation, skill });
  const vocabChoices = (index) => choices(vocabulary[index].translation, [vocabulary[(index + 3) % vocabulary.length].translation, vocabulary[(index + 5) % vocabulary.length].translation]);
  const grammarChoices = (index) => choices(grammarExamples[index].source, sentences.map((sentence) => sentence.text).filter((text) => text !== grammarExamples[index].source));
  const readingChoices = choices(sentences[0].translation, [sentences[3].translation, sentences[6].translation]);
  return {
    id: "lesson_" + prefix, slug, title, summary, estimatedMinutes: 20, status: "published", revision: 1,
    heroTitle: summary, completionTitle: "You can now handle " + title.toLowerCase() + " in independent German.",
    objectives: [summary, "Use " + grammarTitle.toLowerCase() + " accurately", "Produce a connected response with reasons and detail"],
    vocabulary, sentences,
    grammar: { id: "grammar_" + prefix, title: grammarTitle, explanation, pattern, examples: grammarExamples, commonMistake: "Keep the relationship between ideas explicit and check the complete verb frame before finishing." },
    reading: { id: "reading_" + prefix, title: title + ": a connected text", lines: sentences.slice(0, 6).map((sentence, index) => ({ speaker: index % 2 ? "B" : "A", text: sentence.text, translation: sentence.translation })) },
    practice: { id: "practice_" + prefix, passThreshold: 67, questions: [
      question("practice_" + prefix + "_1", "Choose the matching meaning.", vocabulary[0].lemma, vocabChoices(0), vocabulary[0].translation, vocabulary[0].lemma + " means " + vocabulary[0].translation + ".", "vocabulary"),
      question("practice_" + prefix + "_2", "Choose the sentence that demonstrates the lesson pattern.", grammarExamples[0].translation, grammarChoices(0), grammarExamples[0].source, explanation, "grammar"),
      question("practice_" + prefix + "_3", "Recall the connected text.", "Which statement appears in the text?", readingChoices, sentences[0].translation, "The text includes: " + sentences[0].text, "reading"),
    ] },
    quiz: { id: "quiz_" + prefix, title: title + " check", passThreshold: 80, questions: [
      question("quiz_" + prefix + "_1", "Choose the matching meaning.", vocabulary[1].lemma, vocabChoices(1), vocabulary[1].translation, vocabulary[1].lemma + " means " + vocabulary[1].translation + ".", "vocabulary"),
      question("quiz_" + prefix + "_2", "Choose the matching meaning.", vocabulary[6].lemma, vocabChoices(6), vocabulary[6].translation, vocabulary[6].lemma + " means " + vocabulary[6].translation + ".", "vocabulary"),
      question("quiz_" + prefix + "_3", "Choose the sentence that demonstrates the lesson pattern.", grammarExamples[0].translation, grammarChoices(0), grammarExamples[0].source, explanation, "grammar"),
      question("quiz_" + prefix + "_4", "Choose the second correct example of the lesson pattern.", grammarExamples[1].translation, grammarChoices(1), grammarExamples[1].source, explanation, "grammar"),
      question("quiz_" + prefix + "_5", "Recall the connected text.", "Which statement appears in the text?", readingChoices, sentences[0].translation, "The text includes: " + sentences[0].text, "reading"),
    ] },
  };
}
