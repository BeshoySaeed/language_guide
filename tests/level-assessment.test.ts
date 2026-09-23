import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getGermanLevelAssessment, getPublicGermanLevelAssessment } from "../infrastructure/catalog/level-assessment.ts";
import { GERMAN_LEVELS } from "../infrastructure/catalog/lesson-content.ts";
import { gradeLevelAssessment, LEVEL_ASSESSMENT_SKILLS } from "../packages/domain/src/level-assessment.ts";

describe("German level assessments", () => {
  it("builds an A1 seven-skill production checkpoint and keeps later previews compatible", () => {
    for (const level of GERMAN_LEVELS) {
      const assessment = getGermanLevelAssessment(level);
      const requiredSkills = level === "A1" ? LEVEL_ASSESSMENT_SKILLS : LEVEL_ASSESSMENT_SKILLS.slice(0, 5);
      assert.equal(assessment.questions.length, level === "A1" ? 21 : 15);
      assert.equal(assessment.passThreshold, level === "A1" ? 80 : 70);
      for (const skill of requiredSkills) {
        assert.equal(assessment.questions.filter((question) => question.skill === skill).length, 3);
      }
      assert.ok(assessment.questions.filter((question) => question.skill === "listening").every((question) => question.audioText));
      assert.ok(assessment.questions.filter((question) => question.responseMode === "choice").every((question) => question.choices.length === 3 && new Set(question.choices).size === 3));
    }
  });

  it("keeps answer keys out of the public assessment", () => {
    const assessment = getPublicGermanLevelAssessment("A2");
    assert.ok(assessment.questions.every((question) => !("correctAnswer" in question) && !("explanation" in question)));
  });

  it("grades a perfect result by skill and recommends missed lesson sources", () => {
    const assessment = getGermanLevelAssessment("B1");
    const perfect = gradeLevelAssessment(assessment, assessment.questions.map((question) => ({ exerciseId: question.id, response: question.correctAnswer })));
    assert.equal(perfect.percent, 100);
    assert.equal(perfect.passed, true);
    assert.ok(perfect.skills.every((skill) => skill.percent === 100));
    assert.deepEqual(perfect.weakSkills, []);

    const empty = gradeLevelAssessment(assessment, assessment.questions.map((question) => ({ exerciseId: question.id, response: "" })));
    assert.equal(empty.percent, 0);
    assert.deepEqual(empty.weakSkills, LEVEL_ASSESSMENT_SKILLS.slice(0, 5));
    assert.ok(empty.recommendedLessons.length > 0 && empty.recommendedLessons.length <= 3);
  });

  it("requires every A1 skill to reach the minimum threshold", () => {
    const assessment = getGermanLevelAssessment("A1");
    const withoutSpeaking = assessment.questions.map((question) => ({ exerciseId: question.id, response: question.skill === "speaking" ? "" : question.correctAnswer }));
    const grade = gradeLevelAssessment(assessment, withoutSpeaking);
    assert.ok(grade.percent >= assessment.passThreshold);
    assert.equal(grade.passed, false);
    assert.deepEqual(grade.weakSkills, ["speaking"]);
  });
});
