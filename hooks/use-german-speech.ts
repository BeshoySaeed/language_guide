"use client";

import { useCallback, useEffect, useState } from "react";

import { playGermanSpeech, stopGermanSpeech, type SpeechStatus } from "@/lib/german-speech";

export function useGermanSpeech() {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [activeText, setActiveText] = useState<string | null>(null);

  useEffect(() => () => stopGermanSpeech(), []);

  const speak = useCallback((text: string) => {
    setActiveText(text);
    void playGermanSpeech(text, (nextStatus, nextMessage) => {
      setStatus(nextStatus);
      setMessage(nextMessage);
      if (nextStatus === "idle" || nextStatus === "error") setActiveText(null);
    });
  }, []);

  return {
    speak,
    status,
    message,
    activeText,
    isBusy: status === "loading" || status === "speaking",
  };
}
