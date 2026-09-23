export type SpeechStatus = "idle" | "loading" | "speaking" | "error";

export type VoiceDescriptor = Pick<SpeechSynthesisVoice, "default" | "lang" | "localService" | "name" | "voiceURI">;

let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeRequest = 0;
let activeSpeechText: string | null = null;
let restartTimer: ReturnType<typeof setTimeout> | null = null;

export function selectGermanVoice<T extends VoiceDescriptor>(voices: readonly T[]): T | null {
  const germanVoices = voices.filter((voice) => normalizeLanguage(voice.lang).startsWith("de"));
  if (!germanVoices.length) return null;

  return [...germanVoices].sort((left, right) => voiceScore(right) - voiceScore(left))[0];
}

export async function playGermanSpeech(
  text: string,
  onStatus: (status: SpeechStatus, message: string | null) => void,
): Promise<void> {
  const cleanText = text.normalize("NFC").replace(/\s+/gu, " ").trim();
  if (!cleanText) return;
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    onStatus("error", "Audio playback is not supported in this browser.");
    return;
  }

  // Ignore a second click on the item that is already being prepared or
  // spoken. Restarting the browser speech engine is what clips words most
  // often, especially when a touch or mouse click is registered twice.
  if (activeSpeechText === cleanText) return;

  const requestId = ++activeRequest;
  activeSpeechText = cleanText;
  clearRestartTimer();
  onStatus("loading", "Preparing German pronunciation…");
  const voice = await waitForGermanVoice(window.speechSynthesis);
  if (requestId !== activeRequest) return;
  if (!voice) {
    activeSpeechText = null;
    onStatus("error", "No German voice is available on this device. Install a German system voice or try another browser.");
    return;
  }

  if (activeUtterance) {
    activeUtterance.onstart = null;
    activeUtterance.onend = null;
    activeUtterance.onerror = null;
  }
  window.speechSynthesis.cancel();
  activeUtterance = null;

  await new Promise<void>((resolve) => {
    restartTimer = setTimeout(resolve, 100);
  });
  restartTimer = null;
  if (requestId !== activeRequest) return;

  const utterance = new SpeechSynthesisUtterance(prepareGermanSpeechText(cleanText));
  utterance.lang = voice.lang || "de-DE";
  utterance.voice = voice;
  utterance.rate = germanSpeechRate(cleanText);
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.onstart = () => {
    if (requestId === activeRequest) onStatus("speaking", `Playing “${cleanText}” with ${voice.name}.`);
  };
  utterance.onend = () => {
    if (requestId !== activeRequest) return;
    activeUtterance = null;
    activeSpeechText = null;
    onStatus("idle", null);
  };
  utterance.onerror = (event) => {
    if (requestId !== activeRequest) return;
    activeUtterance = null;
    activeSpeechText = null;
    if (event.error === "canceled" || event.error === "interrupted") {
      onStatus("idle", null);
      return;
    }
    onStatus("error", "Pronunciation stopped unexpectedly. Please try again.");
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopGermanSpeech() {
  activeRequest += 1;
  activeSpeechText = null;
  clearRestartTimer();
  if (activeUtterance) {
    activeUtterance.onstart = null;
    activeUtterance.onend = null;
    activeUtterance.onerror = null;
  }
  activeUtterance = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function germanSpeechRate(text: string): number {
  return text.trim() ? 0.62 : 1;
}

export function prepareGermanSpeechText(text: string): string {
  const cleanText = text.normalize("NFC").replace(/\s+/gu, " ").trim();
  return /[.!?…]$/u.test(cleanText) ? cleanText : `${cleanText}.`;
}

async function waitForGermanVoice(synthesis: SpeechSynthesis, timeoutMs = 1800): Promise<SpeechSynthesisVoice | null> {
  const immediate = selectGermanVoice(synthesis.getVoices());
  if (immediate) return immediate;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (voice: SpeechSynthesisVoice | null) => {
      if (settled) return;
      settled = true;
      clearInterval(poll);
      clearTimeout(timeout);
      synthesis.removeEventListener("voiceschanged", check);
      resolve(voice);
    };
    const check = () => {
      const voice = selectGermanVoice(synthesis.getVoices());
      if (voice) finish(voice);
    };
    const poll = setInterval(check, 100);
    const timeout = setTimeout(() => finish(selectGermanVoice(synthesis.getVoices())), timeoutMs);
    synthesis.addEventListener("voiceschanged", check);
    check();
  });
}

function voiceScore(voice: VoiceDescriptor): number {
  const language = normalizeLanguage(voice.lang);
  let score = language === "de-de" ? 100 : language === "de-at" || language === "de-ch" ? 90 : 80;
  if (voice.localService) score += 8;
  if (/deutsch|german|katja|conrad|stefan|anna|petra/i.test(voice.name)) score += 5;
  if (voice.default) score += 1;
  return score;
}

function normalizeLanguage(language: string): string {
  return language.trim().replaceAll("_", "-").toLocaleLowerCase("en-US");
}

function clearRestartTimer() {
  if (!restartTimer) return;
  clearTimeout(restartTimer);
  restartTimer = null;
}
