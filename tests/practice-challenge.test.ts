import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { generatePracticeChallenge, gradePracticeChallenge, toPublicPracticeChallenge } from "../packages/domain/src/practice-challenge.ts";

const source = {
  vocabulary: [
    { id: "v1", lemma: "hallo", translation: "hello" },
    { id: "v2", lemma: "bitte", translation: "please" },
    { id: "v3", lemma: "danke", translation: "thanks" },
    { id: "v4", lemma: "das Brot", translation: "bread" },
    { id: "v5", lemma: "der Kaffee", translation: "coffee" },
    { id: "v6", lemma: "kosten", translation: "to cost" },
  ],
  sentences: [
    { id: "s1", text: "Guten Morgen!", translation: "Good morning!" },
    { id: "s2", text: "Ich heiße Lina.", translation: "My name is Lina." },
    { id: "s3", text: "Was kostet das?", translation: "How much does that cost?" },
    { id: "s4", text: "Nein, danke.", translation: "No, thank you." },
  ],
} as const;

describe("practice challenge generation", () => {
  it("is deterministic and balances all four puzzle types", () => {
    const first = generatePracticeChallenge(source, "daily-20260922");
    const second = generatePracticeChallenge(source, "daily-20260922");

    assert.deepEqual(first, second);
    assert.equal(first.questions.length, 8);
    for (const type of ["word_scramble", "sentence_builder", "matching", "missing_word"] as const) {
      assert.equal(first.questions.filter((question) => question.type === type).length, 2);
    }
  });

  it("removes answer keys from the browser contract", () => {
    const publicChallenge = toPublicPracticeChallenge(generatePracticeChallenge(source, "public-contract"));

    for (const question of publicChallenge.questions) {
      assert.equal("correctAnswer" in question, false);
      assert.equal("explanation" in question, false);
    }
  });

  it("keeps the selected German level in the challenge identity", () => {
    const challenge = generatePracticeChallenge(source, "b1-contract", "B1");
    assert.equal(challenge.levelCode, "B1");
    assert.match(challenge.id, /^practice:de:B1:/);
  });

  it("grades a reproducible perfect attempt", () => {
    const challenge = generatePracticeChallenge(source, "perfect-attempt");
    const grade = gradePracticeChallenge(challenge, challenge.questions.map((question) => ({ exerciseId: question.id, response: question.correctAnswer })));

    assert.equal(grade.score, 8);
    assert.equal(grade.percent, 100);
    assert.equal(grade.passed, true);
  });
});
