import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hashPassword, verifyPassword } from "../lib/auth/password.ts";
import { sanitizeReturnTo } from "../lib/auth/return-to.ts";
import { createSession, hashSessionToken } from "../lib/auth/session.ts";
import { loginInputSchema, registerInputSchema } from "../packages/contracts/src/auth.ts";

describe("authentication security primitives", () => {
  it("salts password hashes and verifies without storing the password", async () => {
    const first = await hashPassword("strong-pass-42");
    const second = await hashPassword("strong-pass-42");
    assert.notEqual(first.salt, second.salt);
    assert.notEqual(first.hash, second.hash);
    assert.equal(await verifyPassword("strong-pass-42", first), true);
    assert.equal(await verifyPassword("wrong-pass-42", first), false);
    assert.equal(first.hash.includes("strong-pass-42"), false);
  });

  it("stores only a deterministic hash of an opaque session token", async () => {
    const session = await createSession();
    assert.equal(session.id, await hashSessionToken(session.token));
    assert.notEqual(session.id, session.token);
    assert.ok(new Date(session.expiresAt).getTime() > Date.now());
  });

  it("accepts safe internal return paths and rejects redirects into auth or another origin", () => {
    assert.equal(sanitizeReturnTo("/learn?level=B1#main-content"), "/learn?level=B1#main-content");
    assert.equal(sanitizeReturnTo("https://evil.example/path"), "/");
    assert.equal(sanitizeReturnTo("//evil.example/path"), "/");
    assert.equal(sanitizeReturnTo("/api/auth/logout"), "/");
  });

  it("normalizes emails and enforces registration password strength", () => {
    const valid = registerInputSchema.parse({ displayName: "Lina", email: " LINA@Example.COM ", password: "german-path-42" });
    assert.equal(valid.email, "lina@example.com");
    assert.equal(registerInputSchema.safeParse({ displayName: "Lina", email: "lina@example.com", password: "short" }).success, false);
    assert.equal(loginInputSchema.safeParse({ email: "lina@example.com", password: "x" }).success, true);
  });
});
