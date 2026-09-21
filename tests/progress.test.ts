import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { calculateProgress, nextReviewState } from "../packages/domain/src/progress.ts";

describe("calculateProgress", () => {
  it("rounds a valid ratio to a whole percentage", () => {
    assert.equal(calculateProgress({ completed: 5, total: 8 }), 63);
  });

  it("bounds progress and handles invalid totals", () => {
    assert.equal(calculateProgress({ completed: 12, total: 8 }), 100);
    assert.equal(calculateProgress({ completed: -2, total: 8 }), 0);
    assert.equal(calculateProgress({ completed: 2, total: 0 }), 0);
  });
});

describe("nextReviewState", () => {
  it("moves successful cards through the review lifecycle", () => {
    assert.equal(nextReviewState("new", "good"), "learning");
    assert.equal(nextReviewState("learning", "good"), "review");
    assert.equal(nextReviewState("review", "easy"), "mastered");
  });

  it("returns any failed card to learning", () => {
    assert.equal(nextReviewState("mastered", "again"), "learning");
  });
});

