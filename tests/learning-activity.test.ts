import assert from "node:assert/strict";
import test from "node:test";

import { summarizeLearningActivity } from "../packages/domain/src/learning-activity.ts";

test("summarizes real activity days in the learner timezone", () => {
  const summary = summarizeLearningActivity([
    { kind: "challenge", occurredAt: "2026-09-21T18:30:00.000Z", durationMs: 60_000 },
    { kind: "assessment", occurredAt: "2026-09-21T22:30:00.000Z", durationMs: 90_000 },
    { kind: "review", occurredAt: "2026-09-22T09:00:00.000Z", durationMs: 0 },
  ], new Date("2026-09-22T12:00:00.000Z"), "Africa/Cairo");

  assert.equal(summary.currentStreak, 2);
  assert.equal(summary.activeDaysThisWeek, 2);
  assert.equal(summary.todayActions, 2);
  assert.equal(summary.todayTrackedMinutes, 2);
  assert.deepEqual(summary.week.filter((day) => day.active).map((day) => day.dateKey), ["2026-09-21", "2026-09-22"]);
});

test("continues a streak from yesterday before today's first activity", () => {
  const summary = summarizeLearningActivity([
    { kind: "challenge", occurredAt: "2026-09-21T12:00:00.000Z", durationMs: 60_000 },
    { kind: "assessment", occurredAt: "2026-09-20T12:00:00.000Z", durationMs: 60_000 },
  ], new Date("2026-09-22T08:00:00.000Z"), "UTC");

  assert.equal(summary.currentStreak, 2);
  assert.equal(summary.todayActions, 0);
});

test("ignores future activity and caps implausibly long sessions", () => {
  const summary = summarizeLearningActivity([
    { kind: "assessment", occurredAt: "2026-09-22T07:00:00.000Z", durationMs: 86_400_000 },
    { kind: "review", occurredAt: "2026-09-23T07:00:00.000Z", durationMs: 0 },
  ], new Date("2026-09-22T08:00:00.000Z"), "UTC");

  assert.equal(summary.todayActions, 1);
  assert.equal(summary.todayTrackedMinutes, 120);
});
