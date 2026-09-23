"use client";

import { ArrowRight, CheckCircle2, Headphones, LoaderCircle, RotateCcw, Volume2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useGermanSpeech } from "@/hooks/use-german-speech";
import type { DueReviewView } from "@/infrastructure/learning/personal-library";
import type { ReviewRating } from "@/packages/domain/src/review-scheduler";

const ratingOptions: { rating: ReviewRating; label: string; hint: string; className: string }[] = [
  { rating: "again", label: "Again", hint: "10 min", className: "border-destructive/30 text-destructive hover:bg-destructive/5" },
  { rating: "hard", label: "Hard", hint: "1 day", className: "border-[#d49a55]/40 text-[#8a551b] hover:bg-[#fff4e4] dark:text-[#ffd29b] dark:hover:bg-[#3a2919]" },
  { rating: "good", label: "Good", hint: "2 days", className: "border-primary/30 text-primary hover:bg-accent" },
  { rating: "easy", label: "Easy", hint: "4 days", className: "border-progress/30 text-progress hover:bg-accent" },
];

export function ReviewSession({ initialItems }: { initialItems: DueReviewView[] }) {
  const [items, setItems] = useState(initialItems);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const speech = useGermanSpeech();
  const reviewedCount = initialItems.length - items.length;
  const current = items[0];
  const cardRef = useRef<HTMLElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const previousItemId = useRef(current?.reviewItemId);

  useEffect(() => {
    const currentItemId = current?.reviewItemId;
    if (previousItemId.current === currentItemId) return;
    previousItemId.current = currentItemId;
    (currentItemId ? cardRef.current : completionRef.current)?.focus({ preventScroll: true });
  }, [current?.reviewItemId]);

  async function rate(rating: ReviewRating) {
    if (!current || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/me/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reviewItemId: current.reviewItemId, rating, clientOperationId: crypto.randomUUID() }) });
      const body = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message ?? "Your review could not be saved.");
      setItems((queue) => queue.slice(1));
      setRevealed(false);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Your review could not be saved.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!current) {
    return <div ref={completionRef} tabIndex={-1} aria-live="polite" className="mt-10 rounded-[28px] border border-border bg-card px-6 py-14 text-center outline-none shadow-[0_12px_38px_rgba(22,44,52,0.055)]"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent text-progress"><CheckCircle2 aria-hidden="true" className="size-7" /></span><p className="mt-6 text-sm font-bold text-progress">Queue complete</p><h2 className="font-display mt-1 text-3xl font-bold">You’re caught up.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">{reviewedCount ? `You reviewed ${reviewedCount} ${reviewedCount === 1 ? "word" : "words"}. We’ll bring them back at the right time.` : "Save vocabulary during a lesson and it will appear here when it is ready to review."}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Button asChild variant="outline"><Link href="/library">Open library</Link></Button><Button asChild><Link href="/learn">Continue learning<ArrowRight aria-hidden="true" /></Link></Button></div></div>;
  }

  return <div className="mt-10">
    <div className="mb-3 flex items-center justify-between text-sm font-bold"><span>{reviewedCount + 1} of {initialItems.length}</span><span className="text-muted-foreground">{items.length} remaining</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Review session progress" aria-valuemin={0} aria-valuemax={initialItems.length} aria-valuenow={reviewedCount}><div className="h-full rounded-full bg-progress transition-all" style={{ width: `${(reviewedCount / initialItems.length) * 100}%` }} /></div>
    <article ref={cardRef} tabIndex={-1} aria-label={`Review ${reviewedCount + 1} of ${initialItems.length}: ${current.vocabulary.lemma}`} className="mt-6 rounded-[32px] border border-border bg-card p-6 text-center outline-none shadow-[0_20px_55px_rgba(22,44,52,0.08)] sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.13em] text-progress">German · {current.vocabulary.partOfSpeech}</p>
      <h2 className="font-display mt-8 text-[clamp(3rem,9vw,6rem)] font-bold leading-none tracking-[-0.055em]">{current.vocabulary.lemma}</h2>
      <button type="button" disabled={speech.activeText === current.vocabulary.lemma && speech.isBusy} onClick={() => speech.speak(current.vocabulary.lemma)} className="mx-auto mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-muted-foreground hover:bg-muted disabled:opacity-60">{speech.activeText === current.vocabulary.lemma && speech.status === "loading" ? <LoaderCircle className="size-4 animate-spin" /> : speech.activeText === current.vocabulary.lemma && speech.status === "speaking" ? <Volume2 className="size-4" /> : <Headphones className="size-4" />}{speech.activeText === current.vocabulary.lemma && speech.isBusy ? "Playing German…" : "Hear pronunciation"}</button>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm font-semibold text-muted-foreground">{speech.message}</p>
      {revealed ? <div className="mt-8 border-t border-border pt-8"><p className="font-display text-3xl font-bold">{current.vocabulary.translation}</p><p className="mt-2 text-sm text-muted-foreground">{current.vocabulary.pronunciation !== "audio" ? `/${current.vocabulary.pronunciation}/ · ` : ""}from {current.lesson.title}</p></div> : <Button size="lg" className="mt-10 h-12 min-w-44" onClick={() => setRevealed(true)}>Show answer</Button>}
    </article>
    {revealed ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{ratingOptions.map((option) => <Button key={option.rating} variant="outline" disabled={submitting} onClick={() => rate(option.rating)} className={`h-auto min-h-16 flex-col gap-0.5 rounded-xl ${option.className}`}><span>{option.label}</span><span className="text-xs font-medium opacity-70">{option.hint}</span></Button>)}</div> : null}
    {error ? <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive"><span>{error}</span><Button variant="ghost" size="sm" onClick={() => setError(null)}><RotateCcw />Dismiss</Button></div> : null}
  </div>;
}
