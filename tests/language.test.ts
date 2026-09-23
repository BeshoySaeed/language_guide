import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { assertSupportedLevel, isCefrLevel, type Language } from "../packages/domain/src/language.ts";

const language: Language = {
  code: "de",
  name: "German",
  nativeName: "Deutsch",
  flag: "🇩🇪",
  direction: "ltr",
  availableLevels: ["A1", "A2"],
};

describe("language level rules", () => {
  it("recognizes supported CEFR values", () => {
    assert.equal(isCefrLevel("B1"), true);
    assert.equal(isCefrLevel("B2"), false);
    assert.equal(isCefrLevel("C1"), false);
  });

  it("rejects levels unavailable for a language", () => {
    assert.doesNotThrow(() => assertSupportedLevel(language, "A1"));
    assert.throws(() => assertSupportedLevel(language, "B1"), /not available/);
  });
});
