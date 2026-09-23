import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { gradeAttempt, normalizeAnswer } from "../packages/domain/src/assessment.ts";

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
});
