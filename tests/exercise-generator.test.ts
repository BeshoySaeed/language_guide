import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { generateVocabularyQuestions } from "../packages/domain/src/exercise-generator.ts";

const entries = [
  { id: "v1", lemma: "das Brot", translation: "bread" },
  { id: "v2", lemma: "die Milch", translation: "milk" },
  { id: "v3", lemma: "der Tee", translation: "tea" },
  { id: "v4", lemma: "der Kaffee", translation: "coffee" },
];

describe("generateVocabularyQuestions", () => {
  it("is deterministic for the same policy seed", () => {
    const first = generateVocabularyQuestions(entries, { seed: "lesson-1", count: 3 });
    const replay = generateVocabularyQuestions(entries, { seed: "lesson-1", count: 3 });
    assert.deepEqual(first, replay);
  });

  it("creates valid questions with unique choices and one accepted answer", () => {
    const questions = generateVocabularyQuestions(entries, { seed: "lesson-2", count: 4 });
    assert.equal(questions.length, 4);
    for (const question of questions) {
      assert.equal(question.choices.length, 3);
      assert.equal(new Set(question.choices).size, 3);
      assert.ok(question.choices.includes(question.correctAnswer));
      assert.equal(question.policyVersion, 1);
    }
  });
});
