"use client";

import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Language, LanguageCode, CefrLevel } from "@/packages/domain/src/language";
import { CEFR_LEVELS } from "@/packages/domain/src/language";

type Props = {
  languages: readonly Language[];
  signedIn: boolean;
  signInPath: string;
};

export function LanguageSelector({ languages, signedIn, signInPath }: Props) {
  const [languageCode, setLanguageCode] = useState<LanguageCode>("de");
  const [level, setLevel] = useState<CefrLevel>("A1");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const selectedLanguage = useMemo(() => languages.find((item) => item.code === languageCode) ?? languages[0], [languageCode, languages]);

  const saveEnrollment = useCallback(async (nextLanguageCode: LanguageCode, nextLevel: CefrLevel) => {
    if (!signedIn) throw new Error("Sign in before saving your learning path.");
    setStatus("saving");
    const response = await fetch("/api/v1/me/enrollments", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({ languageCode: nextLanguageCode, level: nextLevel }),
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("Your selection could not be saved.");
    }
    setLanguageCode(nextLanguageCode);
    setLevel(nextLevel);
    setStatus("saved");
    return { languageCode: nextLanguageCode, level: nextLevel, saved: true };
  }, [signedIn]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "list_learning_languages",
      title: "List learning languages",
      description: "List the languages and CEFR levels currently available in Language Guide.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: () => ({ languages }),
    }, { signal: lifecycle.signal })).catch(() => undefined);
    void Promise.resolve(context.registerTool({
      name: "select_learning_language",
      title: "Select learning language",
      description: "Save one supported language and CEFR level as the user's active learning path.",
      inputSchema: {
        type: "object",
        properties: { languageCode: { type: "string", enum: languages.map((item) => item.code) }, level: { type: "string", enum: [...CEFR_LEVELS] } },
        required: ["languageCode", "level"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async (input) => {
        const candidate = input as { languageCode?: string; level?: string };
        const language = languages.find((item) => item.code === candidate.languageCode);
        if (!language || !language.availableLevels.includes(candidate.level as CefrLevel)) throw new Error("Choose a supported language and level.");
        return saveEnrollment(language.code, candidate.level as CefrLevel);
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, [languages, saveEnrollment]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
      <section aria-labelledby="language-heading">
        <div className="max-w-xl">
          <p className="text-sm font-bold text-progress">Step 1 of 2</p>
          <h2 id="language-heading" className="font-display mt-2 text-3xl font-bold tracking-[-0.045em]">What do you want to learn?</h2>
          <p className="mt-2 text-muted-foreground">Choose one now. You can add more languages at any time.</p>
        </div>
        <RadioGroup value={languageCode} onValueChange={(value) => { setLanguageCode(value as LanguageCode); setStatus("idle"); }} className="mt-6 grid gap-3 sm:grid-cols-3">
          {languages.map((language) => (
            <label key={language.code} className={`relative cursor-pointer rounded-2xl border p-5 transition ${languageCode === language.code ? "border-primary bg-accent shadow-[0_12px_30px_rgba(22,63,69,0.09)]" : "bg-card hover:border-primary/40"}`}>
              <RadioGroupItem value={language.code} className="sr-only" />
              <span className="text-3xl" aria-hidden="true">{language.flag}</span>
              <span className="mt-5 block font-display text-xl font-bold">{language.name}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{language.nativeName}</span>
              {languageCode === language.code ? <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-3.5" aria-hidden="true" /></span> : null}
            </label>
          ))}
        </RadioGroup>

        <fieldset className="mt-8">
          <legend className="font-display text-2xl font-bold tracking-[-0.035em]">Choose your current level</legend>
          <p className="mt-1 text-sm text-muted-foreground">Not sure? Start with A1—you can change this later.</p>
          <RadioGroup value={level} onValueChange={(value) => { setLevel(value as CefrLevel); setStatus("idle"); }} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {selectedLanguage.availableLevels.map((option) => (
              <label key={option} className={`cursor-pointer rounded-xl border px-4 py-3 text-center transition ${level === option ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/40"}`}>
                <RadioGroupItem value={option} className="sr-only" />
                <span className="block text-lg font-black">{option}</span>
                <span className={`text-xs font-semibold ${level === option ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{levelLabel(option)}</span>
              </label>
            ))}
          </RadioGroup>
        </fieldset>
      </section>

      <aside className="h-fit rounded-[26px] bg-ink p-6 text-white shadow-[0_20px_55px_rgba(13,33,39,0.16)] sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">Your learning path</p>
        <div className="mt-6 flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-white/10 text-3xl" aria-hidden="true">{selectedLanguage.flag}</span>
          <div><p className="font-display text-2xl font-bold">{selectedLanguage.name} {level}</p><p className="mt-1 text-sm text-white/60">Foundations · 12 lessons</p></div>
        </div>
        <ul className="mt-7 space-y-3 text-sm text-white/75">
          <li className="flex gap-2"><Check className="mt-0.5 size-4 text-progress" aria-hidden="true" /> Practical vocabulary and sentences</li>
          <li className="flex gap-2"><Check className="mt-0.5 size-4 text-progress" aria-hidden="true" /> Clear grammar in short lessons</li>
          <li className="flex gap-2"><Check className="mt-0.5 size-4 text-progress" aria-hidden="true" /> Daily review that adapts to you</li>
        </ul>
        {signedIn ? (
          <Button className="mt-8 h-12 w-full rounded-xl bg-white font-bold text-ink hover:bg-white/90" disabled={status === "saving"} onClick={() => void saveEnrollment(languageCode, level).catch(() => undefined)}>
            {status === "saving" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
            {status === "saved" ? "Learning path saved" : "Save learning path"}
            {status === "idle" ? <ArrowRight aria-hidden="true" /> : null}
          </Button>
        ) : (
          <Button asChild className="mt-8 h-12 w-full rounded-xl bg-white font-bold text-ink hover:bg-white/90"><a href={signInPath} target="_top">Sign in to save<ArrowRight aria-hidden="true" /></a></Button>
        )}
        <p aria-live="polite" className={`mt-3 text-center text-xs ${status === "error" ? "text-red-200" : "text-white/55"}`}>
          {status === "error" ? "Could not save. Please try again." : status === "saved" ? "Saved across your devices." : "Your progress stays private to your account."}
        </p>
      </aside>
    </div>
  );
}

function levelLabel(level: CefrLevel) {
  return ({ A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper intermediate" } as const)[level];
}

