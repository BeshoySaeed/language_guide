"use client";

import { ArrowRight, CheckCircle2, CircleAlert, RotateCcw, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prefersReducedMotion } from "@/lib/motion";
import type { PublicChallengeQuestion, PublicPracticeChallenge } from "@/packages/domain/src/practice-challenge";

type Feedback = { exerciseId: string; correct: boolean; correctAnswer: string; explanation: string };
type Result = { score: number; maxScore: number; percent: number; passed: boolean; answers: Feedback[]; saved: boolean };

const typeLabels = { word_scramble: "Word scramble", sentence_builder: "Sentence builder", matching: "Matching", missing_word: "Missing word" } as const;

export function PracticeArena({ challenge, signedIn }: { challenge: PublicPracticeChallenge; signedIn: boolean }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [tokenSelections, setTokenSelections] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef(new Date().toISOString());
  const resultRef = useRef<HTMLElement>(null);
  const feedback = useMemo(() => new Map(result?.answers.map((answer) => [answer.exerciseId, answer])), [result]);
  const complete = challenge.questions.every((question) => Boolean(answers[question.id]?.trim()));

  function chooseToken(question: Extract<PublicChallengeQuestion, { type: "sentence_builder" }>, tokenId: string) {
    if (result) return;
    const selected = [...(tokenSelections[question.id] ?? []), tokenId];
    setTokenSelections((current) => ({ ...current, [question.id]: selected }));
    setAnswers((current) => ({ ...current, [question.id]: selected.map((id) => question.tokens.find((token) => token.id === id)?.label ?? "").join(" ") }));
  }

  function resetBuilder(questionId: string) {
    setTokenSelections((current) => ({ ...current, [questionId]: [] }));
    setAnswers((current) => ({ ...current, [questionId]: "" }));
  }

  async function submit() {
    if (!complete || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/practice/challenge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.id, levelCode: challenge.levelCode, seed: challenge.seed, clientOperationId: crypto.randomUUID(), startedAt: startedAt.current, answers: challenge.questions.map((question) => ({ exerciseId: question.id, response: answers[question.id] })) }),
      });
      const body = await response.json() as { data?: Result; error?: { message?: string } };
      if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Your practice could not be checked.");
      setResult(body.data);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Your practice could not be checked.");
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setAnswers({});
    setTokenSelections({});
    setResult(null);
    setError(null);
    startedAt.current = new Date().toISOString();
  }

  useEffect(() => {
    if (!result) return;
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
  }, [result]);

  return <>
    <div className="mt-8 grid gap-3 sm:grid-cols-4">{Object.entries(typeLabels).map(([type, label]) => <div key={type} className="rounded-2xl border border-border bg-card p-4"><p className="text-xs font-bold uppercase tracking-wide text-progress">2 rounds</p><p className="mt-1 text-sm font-bold">{label}</p></div>)}</div>
    {result ? <section ref={resultRef} tabIndex={-1} aria-live="polite" className={`mt-8 rounded-[28px] border p-6 outline-none sm:p-8 ${result.passed ? "border-progress/30 bg-accent" : "border-[#d49a55]/40 bg-[#fff4e4] dark:bg-[#3a2919]"}`}><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-card text-progress shadow-sm">{result.passed ? <Trophy aria-hidden="true" className="size-7" /> : <Sparkles aria-hidden="true" className="size-7" />}</span><div><p className="text-sm font-bold text-progress">Workout complete</p><h2 className="font-display mt-1 text-3xl font-bold">{result.score} of {result.maxScore} correct</h2><p className="mt-1 text-sm text-muted-foreground">{result.saved ? "Your result is saved to your account." : "Sign in anytime to keep future practice results."}</p></div><div className="sm:ml-auto"><p className="font-display text-5xl font-bold">{result.percent}%</p></div></div></section> : null}
    <div className="mt-8 space-y-5">{challenge.questions.map((question, index) => <QuestionCard key={question.id} question={question} index={index} answer={answers[question.id] ?? ""} selectedTokens={tokenSelections[question.id] ?? []} feedback={feedback.get(question.id)} disabled={Boolean(result)} onAnswer={(response) => setAnswers((current) => ({ ...current, [question.id]: response }))} onChooseToken={(tokenId) => question.type === "sentence_builder" && chooseToken(question, tokenId)} onResetBuilder={() => resetBuilder(question.id)} />)}</div>
    {error ? <p role="alert" className="mt-5 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</p> : null}
    <div className="mt-8 flex flex-wrap justify-end gap-3">{result ? <><Button variant="outline" size="lg" onClick={retry}><RotateCcw />Try this set again</Button><Button asChild size="lg"><Link href="/learn">Continue learning<ArrowRight /></Link></Button></> : <Button size="lg" disabled={!complete || submitting} onClick={submit}>{submitting ? "Checking…" : "Check workout"}<ArrowRight /></Button>}</div>
    {!signedIn && !result ? <p className="mt-4 text-right text-xs font-semibold text-muted-foreground">You can practice without signing in. Sign in to save your score.</p> : null}
  </>;
}

function QuestionCard({ question, index, answer, selectedTokens, feedback, disabled, onAnswer, onChooseToken, onResetBuilder }: { question: PublicChallengeQuestion; index: number; answer: string; selectedTokens: string[]; feedback?: Feedback; disabled: boolean; onAnswer: (value: string) => void; onChooseToken: (tokenId: string) => void; onResetBuilder: () => void }) {
  return <fieldset disabled={disabled} className={`rounded-[24px] border bg-card p-5 shadow-[0_8px_24px_rgba(22,44,52,0.04)] sm:p-6 ${feedback?.correct ? "border-progress/50" : feedback ? "border-destructive/40" : "border-border"}`}><legend className="sr-only">Question {index + 1}</legend><div className="flex items-start gap-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-xs font-black">{String(index + 1).padStart(2, "0")}</span><div><p className="text-xs font-bold uppercase tracking-wide text-progress">{typeLabels[question.type]} · {question.instruction}</p><h2 className="font-display mt-2 text-xl font-bold sm:text-2xl">{question.prompt}</h2></div></div><div className="mt-6">{renderQuestionInput(question, answer, selectedTokens, onAnswer, onChooseToken, onResetBuilder)}</div>{feedback ? <div className={`mt-5 flex gap-3 rounded-xl p-4 text-sm ${feedback.correct ? "bg-accent" : "bg-destructive/5"}`}><span className={feedback.correct ? "text-progress" : "text-destructive"}>{feedback.correct ? <CheckCircle2 className="size-5" /> : <CircleAlert className="size-5" />}</span><div><p className="font-bold">{feedback.correct ? "Correct" : `Answer: ${feedback.correctAnswer}`}</p><p className="mt-1 leading-6 text-muted-foreground">{feedback.explanation}</p></div></div> : null}</fieldset>;
}

function renderQuestionInput(question: PublicChallengeQuestion, answer: string, selectedTokens: string[], onAnswer: (value: string) => void, onChooseToken: (tokenId: string) => void, onResetBuilder: () => void) {
  if (question.type === "word_scramble") return <div><div className="mb-4 flex flex-wrap gap-2" aria-label={`Scrambled word: ${question.scrambled}`}>{question.scrambled.split("").map((letter, index) => <span key={`${letter}-${index}`} className="grid min-h-10 min-w-9 place-items-center rounded-lg bg-ink px-2 font-display text-lg font-bold text-white">{letter === " " ? "·" : letter}</span>)}</div><Input value={answer} onChange={(event) => onAnswer(event.target.value)} aria-label="Your answer in German" placeholder="Type the German word" className="h-12 rounded-xl" autoComplete="off" /></div>;
  if (question.type === "sentence_builder") return <div><div className="min-h-14 rounded-xl border border-dashed border-primary/35 bg-accent/50 p-3 text-base font-bold">{answer || <span className="font-normal text-muted-foreground">Choose words below…</span>}</div><div className="mt-3 flex flex-wrap gap-2">{question.tokens.map((token) => <Button key={token.id} type="button" variant="outline" disabled={selectedTokens.includes(token.id)} onClick={() => onChooseToken(token.id)} className="h-10">{token.label}</Button>)}</div><Button type="button" variant="ghost" size="sm" className="mt-2" onClick={onResetBuilder}>Reset sentence</Button></div>;
  const choices = question.choices;
  const prompt = question.type === "missing_word" ? question.sentenceWithBlank : question.source;
  return <div>{question.type === "missing_word" ? <p className="mb-4 rounded-xl bg-ink p-4 font-display text-xl font-bold text-white">{prompt}</p> : null}<div className="grid gap-2 sm:grid-cols-2">{choices.map((choice) => <label key={choice} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${answer === choice ? "border-primary bg-accent" : "border-border hover:bg-muted/60"}`}><input type="radio" name={question.id} checked={answer === choice} onChange={() => onAnswer(choice)} className="size-4 accent-[var(--primary)]" /><span>{choice}</span></label>)}</div></div>;
}
