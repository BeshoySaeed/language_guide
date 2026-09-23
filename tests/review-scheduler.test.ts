import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { scheduleReview } from "../packages/domain/src/review-scheduler.ts";

const reviewedAt = new Date("2026-09-22T08:00:00.000Z");

describe("scheduleReview", () => {
  it("returns a forgotten card to learning for ten minutes", () => {
    const result = scheduleReview({ state: "review", rating: "again", intervalDays: 8, easeFactor: 250, repetitionCount: 3, lapseCount: 1, reviewedAt });

    assert.equal(result.state, "learning");
    assert.equal(result.intervalDays, 0);
    assert.equal(result.easeFactor, 230);
    assert.equal(result.repetitionCount, 0);
    assert.equal(result.lapseCount, 2);
    assert.equal(result.dueAt.toISOString(), "2026-09-22T08:10:00.000Z");
  });

  it("graduates a new card with predictable first intervals", () => {
    const good = scheduleReview({ state: "new", rating: "good", intervalDays: 0, easeFactor: 250, repetitionCount: 0, lapseCount: 0, reviewedAt });
    const easy = scheduleReview({ state: "new", rating: "easy", intervalDays: 0, easeFactor: 250, repetitionCount: 0, lapseCount: 0, reviewedAt });

    assert.equal(good.state, "review");
    assert.equal(good.intervalDays, 2);
    assert.equal(easy.intervalDays, 4);
    assert.equal(easy.easeFactor, 265);
  });

  it("expands established intervals and masters repeated easy recalls", () => {
    const result = scheduleReview({ state: "review", rating: "easy", intervalDays: 10, easeFactor: 250, repetitionCount: 3, lapseCount: 0, reviewedAt });

    assert.equal(result.state, "mastered");
    assert.equal(result.intervalDays, 30);
    assert.equal(result.repetitionCount, 4);
    assert.equal(result.dueAt.toISOString(), "2026-10-22T08:00:00.000Z");
  });
});
