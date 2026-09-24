"use client";

import { ArrowRight, CheckCircle2, CircleAlert, Headphones, LoaderCircle, Mic, RotateCcw, Trophy, Volume2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGermanSpeech } from "@/hooks/use-german-speech";
import { prefersReducedMotion } from "@/lib/motion";
import { type LevelAssessmentSkill, type PublicLevelAssessment } from "@/packages/domain/src/level-assessment";

type Feedback = Readonly<{ exerciseId: string; correct: boolean; correctAnswer: string; explanation: string; skill: LevelAssessmentSkill; responseMode: "choice" | "text" | "speech"; feedbackCode: "correct" | "close" | "incorrect" | "missing"; matchPercent?: number }>;
type SkillResult = Readonly<{ skill: LevelAssessmentSkill; correct: number; total: number; percent: number }>;
type Result = Readonly<{ score: number; maxScore: number; percent: number; passed: boolean; answers: readonly Feedback[]; skills: readonly SkillResult[]; strongSkills: readonly LevelAssessmentSkill[]; weakSkills: readonly LevelAssessmentSkill[]; recommendedLessons: readonly string[]; saved: boolean }>;

const skillLabels: Record<LevelAssessmentSkill, string> = { vocabulary: "Vocabulary", sentences: "Sentences", grammar: "Grammar", reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking" };

export function LevelAssessmentPlayer({ assessment, signedIn }: { assessment: PublicLevelAssessment; signedIn: boolean }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef(new Date().toISOString());
  const resultRef = useRef<HTMLElement>(null);
  const speech = useGermanSpeech();
  const feedback = useMemo(() => new Map(result?.answers.map((answer) => [answer.exerciseId, answer])), [result]);
  const answered = assessment.questions.filter((question) => Boolean(answers[question.id])).length;

  async function submit() {
    if (answered !== assessment.questions.length || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/level-assessments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assessmentId: assessment.id, levelCode: assessment.levelCode, clientOperationId: crypto.randomUUID(), startedAt: startedAt.current, answers: assessment.questions.map((question) => ({ exerciseId: question.id, response: answers[question.id] })) }),
      });
      const body = await response.json() as { data?: Result; error?: { message?: string } };
      if (!response.ok || !body.data) throw new Error(body.error?.message ?? "Your level test could not be checked.");
      setResult(body.data);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Your level test could not be checked.");
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setAnswers({});
    setResult(null);
    setError(null);
    startedAt.current = new Date().toISOString();
  }

  useEffect(() => {
    if (!result) return;
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }, [result]);

  return <>
    <div className="mt-7 rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between text-sm font-bold"><span>{answered} of {assessment.questions.length} answered</span><span>{Math.round((answered / assessment.questions.length) * 100)}%</span></div><Progress className="mt-3" value={(answered / assessment.questions.length) * 100} aria-label={`${answered} of ${assessment.questions.length} questions answered`} /></div>
    <div className="mt-4 rounded-2xl border border-border bg-muted/45 p-4 text-sm leading-6 text-muted-foreground"><strong className="text-foreground">How production is checked:</strong> writing and speaking use controlled sentence tasks. The app compares your answer with a model while allowing punctuation, small typos, and limited speech-to-text noise. This checks sentence accuracy; it is not a human rating of free conversation or pronunciation.</div>
    {result ? <section ref={resultRef} tabIndex={-1} aria-live="polite" className={`mt-7 rounded-[28px] border p-6 outline-none sm:p-8 ${result.passed ? "border-progress/35 bg-accent" : "border-[#d49a55]/40 bg-[#fff4e4] dark:bg-[#3a2919]"}`}><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-card text-progress shadow-sm">{result.passed ? <Trophy className="size-7" /> : <CircleAlert className="size-7" />}</span><div><p className="text-sm font-bold text-progress">German {assessment.levelCode} result</p><h2 className="font-display mt-1 text-3xl font-bold">{result.score} of {result.maxScore} correct</h2><p className="mt-1 text-sm text-muted-foreground">{result.passed ? "You passed this level checkpoint." : "Review the recommendations and try again when ready."} {result.saved ? "The result is saved." : "Sign in to save future results."}</p></div><p className="font-display text-5xl font-bold sm:ml-auto">{result.percent}%</p></div><div className="mt-6 grid gap-3 sm:grid-cols-5">{result.skills.map((skill) => <div key={skill.skill} className="rounded-xl bg-card p-3"><p className="text-xs font-bold text-muted-foreground">{skillLabels[skill.skill]}</p><p className="font-display mt-1 text-2xl font-bold">{skill.percent}%</p><p className="text-xs text-muted-foreground">{skill.correct}/{skill.total}</p></div>)}</div>{result.recommendedLessons.length ? <div className="mt-5 rounded-xl bg-card p-4"><p className="font-bold">Recommended review</p><p className="mt-1 text-sm text-muted-foreground">{result.recommendedLessons.join(" · ")}</p></div> : null}</section> : null}
    <div className="mt-8 space-y-5">{assessment.questions.map((question, index) => { const answerFeedback = feedback.get(question.id); const activeAudio = question.audioText && speech.activeText === question.audioText; const productionFeedback = answerFeedback && answerFeedback.responseMode !== "choice"; return <fieldset key={question.id} disabled={Boolean(result)} className={`rounded-[24px] border bg-card p-5 sm:p-6 ${answerFeedback?.correct ? "border-progress/45" : answerFeedback ? "border-destructive/40" : "border-border"}`}><legend className="sr-only">Question {index + 1}</legend><div className="flex items-start gap-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-xs font-black">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-progress">{skillLabels[question.skill]} · {question.instruction}</p><h2 className="font-display mt-2 text-xl font-bold sm:text-2xl">{question.prompt}</h2>{question.audioText ? <Button type="button" variant="outline" size="sm" className="mt-3" disabled={Boolean(activeAudio && speech.isBusy)} onClick={() => speech.speak(question.audioText!)}>{activeAudio && speech.status === "loading" ? <LoaderCircle className="animate-spin" /> : activeAudio && speech.status === "speaking" ? <Volume2 /> : <Headphones />}{activeAudio && speech.isBusy ? "Playing German…" : "Play German audio"}</Button> : null}</div></div>{question.responseMode === "choice" ? <div className="mt-5 grid gap-2">{question.choices.map((choice) => { const selected = answers[question.id] === choice; const correct = answerFeedback?.correctAnswer === choice; const wrong = Boolean(answerFeedback && selected && !answerFeedback.correct); return <label key={choice} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${correct ? "border-progress bg-accent" : wrong ? "border-destructive bg-destructive/5" : selected ? "border-primary bg-accent" : "border-border hover:bg-muted/60"}`}><input type="radio" name={question.id} checked={selected} onChange={() => setAnswers((current) => ({ ...current, [question.id]: choice }))} className="size-4 accent-[var(--primary)]" /><span>{choice}</span>{correct ? <CheckCircle2 className="ml-auto size-4 text-progress" /> : null}</label>; })}</div> : <ProductionResponse mode={question.responseMode} value={answers[question.id] ?? ""} disabled={Boolean(result)} onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))} />}{answerFeedback ? <div className={`mt-4 rounded-xl p-4 text-sm ${answerFeedback.correct ? "bg-accent" : "bg-destructive/5"}`}><p className="font-bold">{productionFeedback ? productionFeedbackTitle(answerFeedback) : answerFeedback.correct ? "Correct" : `Correct answer: ${answerFeedback.correctAnswer}`}</p>{productionFeedback && !answerFeedback.correct ? <p className="mt-1 text-muted-foreground">Model: {answerFeedback.correctAnswer}</p> : null}<p className="mt-1 leading-6 text-muted-foreground">{answerFeedback.explanation}</p></div> : null}</fieldset>; })}</div>
    {error ? <p role="alert" className="mt-5 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</p> : null}
    <div className="mt-8 flex flex-wrap justify-end gap-3">{result ? <><Button variant="outline" size="lg" onClick={retry}><RotateCcw />Try again</Button><Button asChild size="lg"><Link href={`/learn?level=${assessment.levelCode}`}>Review course<ArrowRight /></Link></Button></> : <Button size="lg" disabled={answered !== assessment.questions.length || submitting} onClick={submit}>{submitting ? "Checking…" : "Finish level test"}<ArrowRight /></Button>}</div>
    {!signedIn && !result ? <p className="mt-4 text-right text-xs font-semibold text-muted-foreground">You can take the test without signing in. Sign in to save your result.</p> : null}
  </>;
}

type RecognitionResult = Readonly<{ 0: Readonly<{ transcript: string }> }>;
type RecognitionEvent = Readonly<{ results: ArrayLike<RecognitionResult> }>;
type Recognition = { lang: string; interimResults: boolean; maxAlternatives: number; onresult: ((event: RecognitionEvent) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start(): void };
type RecognitionConstructor = new () => Recognition;

function ProductionResponse({ mode, value, disabled, onChange }: { mode: "text" | "speech"; value: string; disabled: boolean; onChange: (value: string) => void }) {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function startRecognition() {
    const speechWindow = window as typeof window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    const RecognitionApi = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!RecognitionApi) { setMessage("Speech recognition is unavailable here. Say the answer aloud, then type exactly what you said."); return; }
    const recognition = new RecognitionApi();
    recognition.lang = "de-DE";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => { onChange(event.results[0]?.[0]?.transcript ?? ""); setMessage("Transcript captured. Check it before submitting."); };
    recognition.onerror = () => setMessage("The microphone could not capture that. Try again or type what you said.");
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  }

  return <div className="mt-5"><label className="block text-sm font-bold"><span>{mode === "speech" ? "German transcript" : "Your German answer"}</span><textarea rows={3} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder={mode === "speech" ? "Use the microphone or type exactly what you say" : "Write one complete German sentence"} /></label>{mode === "speech" ? <Button type="button" variant="outline" className="mt-2" disabled={disabled || listening} onClick={startRecognition}><Mic />{listening ? "Listening…" : "Use microphone"}</Button> : null}{message ? <p className="mt-2 text-xs font-semibold text-muted-foreground" aria-live="polite">{message}</p> : null}</div>;
}

function productionFeedbackTitle(feedback: Feedback): string {
  const match = feedback.matchPercent === undefined ? "" : ` (${feedback.matchPercent}% model match)`;
  if (feedback.correct) return `Accepted${match}`;
  if (feedback.feedbackCode === "close") return `Close—review the differences${match}`;
  if (feedback.feedbackCode === "missing") return "No answer captured";
  return `Needs more accuracy${match}`;
}

export { skillLabels };
