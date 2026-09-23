"use client";

import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Language, CefrLevel } from "@/packages/domain/src/language";
import { CEFR_LEVELS } from "@/packages/domain/src/language";

type Props = {
  languages: readonly Language[];
  initialLevel: CefrLevel;
  lessonCounts: Readonly<Record<CefrLevel, number>>;
  signedIn: boolean;
};

export function LanguageSelector({ languages, initialLevel, lessonCounts, signedIn }: Props) {
  const router = useRouter();
  const language = languages[0];
  const [level, setLevel] = useState<CefrLevel>(initialLevel);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const saveEnrollment = useCallback(async (nextLevel: CefrLevel) => {
    if (!signedIn) throw new Error("Sign in before saving your learning path.");
    setStatus("saving");
    const response = await fetch("/api/v1/me/enrollments", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({ languageCode: "de", level: nextLevel }),
    });
    if (!response.ok) {
      setStatus("error");
      throw new Error("Your selection could not be saved.");
    }
    setLevel(nextLevel);
    setStatus("saved");
    router.push(`/learn?level=${nextLevel}`);
    return { languageCode: "de", level: nextLevel, saved: true };
  }, [router, signedIn]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "list_learning_languages",
      title: "List learning languages",
      description: "List the German CEFR levels currently available in Language Guide.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: () => ({ languages }),
    }, { signal: lifecycle.signal })).catch(() => undefined);
    void Promise.resolve(context.registerTool({
      name: "select_german_level",
      title: "Select German level",
      description: "Save one supported German CEFR level as the user's active learning path.",
      inputSchema: {
        type: "object",
        properties: { level: { type: "string", enum: [...CEFR_LEVELS] } },
        required: ["level"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async (input) => {
        const candidate = input as { level?: string };
        if (!language?.availableLevels.includes(candidate.level as CefrLevel)) throw new Error("Choose a supported German level.");
        return saveEnrollment(candidate.level as CefrLevel);
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, [language, languages, saveEnrollment]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
      <section aria-labelledby="language-heading">
        <div className="max-w-xl">
          <p className="text-sm font-bold text-progress">German course</p>
          <h2 id="language-heading" className="font-display mt-2 text-3xl font-bold tracking-[-0.045em]">Choose your current level.</h2>
          <p className="mt-2 text-muted-foreground">The first release focuses completely on German, from beginner A1 through independent B1.</p>
        </div>

        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-primary/30 bg-accent p-5">
          <span className="text-3xl" aria-hidden="true">{language.flag}</span>
          <div><p className="font-display text-xl font-bold">German</p><p className="text-sm text-muted-foreground">Deutsch · A1 to B1</p></div>
          <Check className="ml-auto size-5 text-progress" aria-hidden="true" />
        </div>

        <fieldset className="mt-8">
          <legend className="font-display text-2xl font-bold tracking-[-0.035em]">Select a course level</legend>
          <p className="mt-1 text-sm text-muted-foreground">Not sure? Start with A1—you can change this later.</p>
          <RadioGroup value={level} onValueChange={(value) => { setLevel(value as CefrLevel); setStatus("idle"); }} className="mt-4 grid grid-cols-3 gap-3">
            {language.availableLevels.map((option) => (
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
          <span className="grid size-14 place-items-center rounded-2xl bg-white/10 text-3xl" aria-hidden="true">{language.flag}</span>
          <div><p className="font-display text-2xl font-bold">German {level}</p><p className="mt-1 text-sm text-white/60">{levelLabel(level)} · {lessonCounts[level]} lessons</p></div>
        </div>
        <ul className="mt-7 space-y-3 text-sm text-white/75">
          <li className="flex gap-2"><Check className="mt-0.5 size-4 text-progress" aria-hidden="true" /> Practical vocabulary and sentences</li>
          <li className="flex gap-2"><Check className="mt-0.5 size-4 text-progress" aria-hidden="true" /> Clear grammar in short lessons</li>
          <li className="flex gap-2"><Check className="mt-0.5 size-4 text-progress" aria-hidden="true" /> Daily review that adapts to you</li>
        </ul>
        {signedIn ? (
          <Button className="mt-8 h-12 w-full rounded-xl bg-white font-bold text-ink hover:bg-white/90" disabled={status === "saving"} onClick={() => void saveEnrollment(level).catch(() => undefined)}>
            {status === "saving" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
            {status === "saved" ? "Learning path saved" : "Save learning path"}
            {status === "idle" ? <ArrowRight aria-hidden="true" /> : null}
          </Button>
        ) : (
          <Button asChild className="mt-8 h-12 w-full rounded-xl bg-white font-bold text-ink hover:bg-white/90"><Link href={`/learn?level=${level}`}>Open German {level}<ArrowRight aria-hidden="true" /></Link></Button>
        )}
        <p aria-live="polite" className={`mt-3 text-center text-xs ${status === "error" ? "text-red-200" : "text-white/55"}`}>
          {status === "error" ? "Could not save. Please try again." : status === "saved" ? "Saved across your devices." : signedIn ? "Your selected level is saved to your account." : "Sign in whenever you want to save progress."}
        </p>
      </aside>
    </div>
  );
}

function levelLabel(level: CefrLevel) {
  return ({ A1: "Beginner", A2: "Elementary", B1: "Intermediate" } as const)[level];
}
