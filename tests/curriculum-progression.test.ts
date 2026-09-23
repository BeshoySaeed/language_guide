import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { calculateLessonAccess, courseCompletionPercent } from "../packages/domain/src/curriculum-progression.ts";

describe("curriculum progression", () => {
  it("unlocks lessons sequentially and recommends the first available incomplete lesson", () => {
    const access = calculateLessonAccess(["one", "two", "three"], [
      { lessonId: "one", state: "completed", percent: 100 },
    ], true);

    assert.equal(access[0].completed, true);
    assert.equal(access[1].unlocked, true);
    assert.equal(access[1].recommended, true);
    assert.equal(access[2].unlocked, false);
    assert.equal(access[2].prerequisiteLessonId, "two");
  });

  it("keeps existing in-progress work accessible and leaves anonymous exploration open", () => {
    const signedIn = calculateLessonAccess(["one", "two"], [
      { lessonId: "two", state: "in_progress", percent: 25 },
    ], true);
    const anonymous = calculateLessonAccess(["one", "two"], [], false);

    assert.equal(signedIn[1].unlocked, true);
    assert.ok(anonymous.every((item) => item.unlocked));
  });

  it("calculates completion from completed lessons only", () => {
    const access = calculateLessonAccess(["one", "two", "three"], [
      { lessonId: "one", state: "completed", percent: 100 },
      { lessonId: "two", state: "in_progress", percent: 88 },
    ], true);
    assert.equal(courseCompletionPercent(access), 33);
  });
});
