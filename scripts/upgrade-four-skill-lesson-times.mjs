import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const books = [
  ["A1", "everyday-essentials.json", 25],
  ["A2", "everyday-connections.json", 30],
  ["B1", "independent-life.json", 30],
];

for (const [level, file, minimumMinutes] of books) {
  const path = resolve(process.cwd(), `content/languages/de/${level}/books/${file}`);
  const book = JSON.parse(await readFile(path, "utf8"));
  const lessons = book.chapters.flatMap((chapter) => chapter.lessons);
  for (const lesson of lessons) lesson.estimatedMinutes = Math.max(lesson.estimatedMinutes, minimumMinutes);
  book.revision += 1;
  await writeFile(path, `${JSON.stringify(book, null, 2)}\n`, "utf8");
  console.log(`${level}: upgraded ${lessons.length} lesson estimates to at least ${minimumMinutes} minutes.`);
}
