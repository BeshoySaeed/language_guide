import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const books = [
  resolve(process.cwd(), "content/languages/de/A2/books/everyday-connections.json"),
  resolve(process.cwd(), "content/languages/de/B1/books/independent-life.json"),
];

const syntheticTypes = new Set([
  "case chunk",
  "formal noun chunk",
  "infinitive frame",
  "descriptive chunk",
  "useful sentence",
]);

for (const path of books) {
  const book = JSON.parse(await readFile(path, "utf8"));
  let quarantined = 0;
  for (const item of book.coreVocabulary ?? []) {
    if (!syntheticTypes.has(item.partOfSpeech)) continue;
    item.languageFeatures = {
      ...item.languageFeatures,
      qualityStatus: "quarantined",
      qualityReason: "synthetic-pattern-filler",
    };
    quarantined += 1;
  }
  book.revision += 1;
  book.provenance.reviewedBy = "Content integrity audit; synthetic vocabulary quarantined";
  book.provenance.reviewedAt = "2026-09-23";
  await writeFile(path, `${JSON.stringify(book, null, 2)}\n`, "utf8");
  console.log(`${book.levelCode}: quarantined ${quarantined} synthetic vocabulary cards.`);
}
