import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { gradeAttempt, normalizeAnswer, productionMatchPercent } from "../packages/domain/src/assessment.ts";

const questions = [
  { id: "q1", prompt: "bread", correctAnswer: "das Brot" },
  { id: "q2", prompt: "polite request", correctAnswer: "Ich möchte", acceptedAnswers: ["ich mochte"] },
] as const;

describe("normalizeAnswer", () => {
  it("normalizes casing, whitespace, unicode, and terminal punctuation", () => {
    assert.equal(normalizeAnswer("  DAS   BROT! "), "das brot");
  });
});

describe("gradeAttempt", () => {
  it("grades a deterministic snapshot and applies the pass threshold", () => {
    const result = gradeAttempt(questions, [
      { exerciseId: "q1", response: "das Brot." },
      { exerciseId: "q2", response: "ich mochte" },
    ], 80);

    assert.equal(result.score, 2);
    assert.equal(result.percent, 100);
    assert.equal(result.passed, true);
    assert.deepEqual(result.answers.map((answer) => answer.promptSnapshot), ["bread", "polite request"]);
  });

  it("marks missing answers explicitly and cannot pass an empty attempt", () => {
    const result = gradeAttempt(questions, [], 80);
    assert.equal(result.score, 0);
    assert.equal(result.passed, false);
    assert.equal(result.answers[0].feedbackCode, "missing");
  });

  it("tolerates small production differences without weakening exact questions", () => {
    const production = gradeAttempt([{
      id: "production",
      prompt: "I would like to arrange an appointment.",
      correctAnswer: "Ich würde gern einen Termin vereinbaren.",
      gradingMode: "production_text",
    }], [{ exerciseId: "production", response: "Ich würde gerne einen Termin vereinbaren" }], 80);
    const exact = gradeAttempt(questions, [{ exerciseId: "q1", response: "Brot" }], 80);

    assert.equal(production.answers[0].correct, true);
    assert.ok((production.answers[0].matchPercent ?? 0) >= 88);
    assert.equal(exact.answers[0].correct, false);
  });

  it("rewards word order and rejects a word salad with the same vocabulary", () => {
    const expected = "Ich würde gern einen Termin vereinbaren.";
    assert.equal(productionMatchPercent(expected, "Ich würde gern einen Termin vereinbaren"), 100);
    assert.ok(productionMatchPercent(expected, "einen Termin Ich vereinbaren würde gern") < 60);
  });
});
