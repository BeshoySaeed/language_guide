import assert from "node:assert/strict";
import test from "node:test";

import { classifySyncResponse, mergeOfflineMutation, type OfflineMutation } from "../packages/domain/src/offline-sync.ts";

function operation(overrides: Partial<OfflineMutation>): OfflineMutation {
  return {
    id: "operation-1",
    kind: "saved_item",
    entityKey: "saved-item:vocab_de_hallo",
    method: "POST",
    url: "/api/v1/me/saved-items",
    body: { contentItemId: "vocab_de_hallo" },
    createdAt: "2026-09-22T08:00:00.000Z",
    status: "pending",
    ...overrides,
  };
}

test("latest saved-item intention replaces an older conflicting intention", () => {
  const save = operation({ id: "save", method: "POST" });
  const remove = operation({ id: "remove", method: "DELETE", body: null, createdAt: "2026-09-22T08:01:00.000Z" });

  assert.deepEqual(mergeOfflineMutation([save], remove), [remove]);
});

test("assessment attempts remain append-only and ordered", () => {
  const later = operation({ id: "attempt-2", kind: "assessment_attempt", entityKey: "attempt:2", createdAt: "2026-09-22T08:02:00.000Z" });
  const earlier = operation({ id: "attempt-1", kind: "assessment_attempt", entityKey: "attempt:1", createdAt: "2026-09-22T08:01:00.000Z" });

  assert.deepEqual(mergeOfflineMutation([later], earlier).map((item) => item.id), ["attempt-1", "attempt-2"]);
});

test("sync response classification separates retryable and permanent failures", () => {
  assert.equal(classifySyncResponse(201), "applied");
  assert.equal(classifySyncResponse(401), "blocked");
  assert.equal(classifySyncResponse(422), "rejected");
  assert.equal(classifySyncResponse(503), "retry");
});
