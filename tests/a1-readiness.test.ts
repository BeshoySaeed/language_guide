import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { evaluateA1Readiness, evaluateA2Readiness, evaluateB1Readiness } from "../packages/domain/src/a1-readiness.ts";
import { LEVEL_ASSESSMENT_SKILLS } from "../packages/domain/src/level-assessment.ts";

const lessons = ["one", "two", "three"];
const mastered = lessons.map((lessonId) => ({ lessonId, state: "completed" as const, bestScore: 80 }));
const assessment = { percent: 80, passed: true, skills: LEVEL_ASSESSMENT_SKILLS.map((skill) => ({ skill, percent: 70 })) };

describe("A1 readiness", () => {
  it("requires course mastery, all seven final skills, and a current review queue", () => {
    assert.equal(evaluateA1Readiness({ requiredLessonIds: lessons, lessonProgress: mastered, assessment, dueReviewCount: 0 }).ready, true);
    assert.equal(evaluateA1Readiness({ requiredLessonIds: lessons, lessonProgress: mastered, assessment, dueReviewCount: 1 }).nextAction, "clear_review");
  });

  it("routes unfinished and weak work to the correct next action", () => {
    const unfinished = evaluateA1Readiness({ requiredLessonIds: lessons, lessonProgress: mastered.slice(0, 2), assessment: null, dueReviewCount: 0 });
    assert.equal(unfinished.nextAction, "continue_lessons");
    assert.deepEqual(unfinished.reviewLessonIds, ["three"]);

    const weakAssessment = { ...assessment, passed: false, skills: assessment.skills.map((item) => item.skill === "speaking" ? { ...item, percent: 60 } : item) };
    const weak = evaluateA1Readiness({ requiredLessonIds: lessons, lessonProgress: mastered, assessment: weakAssessment, dueReviewCount: 0 });
    assert.equal(weak.nextAction, "review_skills");
    assert.deepEqual(weak.weakSkills, ["speaking"]);
  });

  it("applies the same seven-skill mastery gate before B1", () => {
    const ready = evaluateA2Readiness({ requiredLessonIds: lessons, lessonProgress: mastered, assessment, dueReviewCount: 0 });
    assert.equal(ready.ready, true);
    assert.equal(ready.nextAction, "start_next_level");
    assert.match(ready.requirements[0].label, /A2/);
  });

  it("applies the same seven-skill mastery gate before B2", () => {
    const ready = evaluateB1Readiness({ requiredLessonIds: lessons, lessonProgress: mastered, assessment, dueReviewCount: 0 });
    assert.equal(ready.ready, true);
    assert.equal(ready.nextAction, "start_next_level");
    assert.match(ready.requirements[0].label, /B1/);
  });
});
