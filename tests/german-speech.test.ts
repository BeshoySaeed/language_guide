import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  germanSpeechRate,
  prepareGermanSpeechText,
  selectGermanVoice,
  type VoiceDescriptor,
} from "../lib/german-speech.ts";

function voice(name: string, lang: string, localService = true, isDefault = false): VoiceDescriptor {
  return { name, lang, localService, default: isDefault, voiceURI: name };
}

describe("selectGermanVoice", () => {
  it("never falls back to an English voice", () => {
    assert.equal(selectGermanVoice([voice("English", "en-US")]), null);
  });

  it("prefers an exact German voice over another German locale", () => {
    const selected = selectGermanVoice([
      voice("Anna", "de-AT"),
      voice("Microsoft Katja", "de-DE"),
      voice("English", "en-US", true, true),
    ]);

    assert.equal(selected?.name, "Microsoft Katja");
  });

  it("normalizes underscore locale identifiers", () => {
    assert.equal(selectGermanVoice([voice("Deutsch", "de_DE")])?.name, "Deutsch");
  });
});

describe("German speech pacing", () => {
  it("uses the same clear pace for vocabulary and complete phrases", () => {
    assert.equal(germanSpeechRate("Entschuldigung"), 0.62);
    assert.equal(germanSpeechRate("Guten Morgen"), 0.62);
    assert.equal(germanSpeechRate("Wie geht es Ihnen heute?"), 0.62);
  });

  it("adds terminal punctuation to protect the final syllable", () => {
    assert.equal(prepareGermanSpeechText("Entschuldigung"), "Entschuldigung.");
    assert.equal(prepareGermanSpeechText("Wie geht es dir?"), "Wie geht es dir?");
  });
});
