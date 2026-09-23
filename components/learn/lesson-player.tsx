"use client";

import { ArrowLeft, ArrowRight, BookOpenText, Bookmark, Check, CheckCircle2, CircleAlert, Headphones, Languages, LoaderCircle, LockKeyhole, MessageCircleMore, RotateCcw, Sparkles, Trophy, Volume2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { OfflineDownloadButton } from "@/components/offline/offline-download-button";
import { Progress } from "@/components/ui/progress";
import { useGermanSpeech } from "@/hooks/use-german-speech";
import type { PublicChoiceQuestion, PublicLesson } from "@/infrastructure/catalog/lesson-content";
import { prefersReducedMotion } from "@/lib/motion";
import { submitWithOfflineFallback } from "@/lib/offline-sync";

type SectionId = "overview" | "vocabulary" | "sentences" | "grammar" | "reading" | "practice" | "quiz" | "complete";
type GradedAnswer = { exerciseId: string; correct: boolean; correctAnswer: string; explanation: string };
type GradeResult = { score: number; maxScore: number; percent: number; passed: boolean; answers: GradedAnswer[]; progress: { state: string; percent: number } };

const sectionMeta: readonly { id: SectionId; label: string }[] = [
  { id: "overview", label: "Welcome" },
  { id: "vocabulary", label: "Vocabulary" },
  { id: "sentences", label: "Useful phrases" },
  { id: "grammar", label: "Grammar pattern" },
  { id: "reading", label: "Mini dialogue" },
  { id: "practice", label: "Guided practice" },
  { id: "quiz", label: "Lesson check" },
  { id: "complete", label: "Summary" },
];

export function LessonPlayer({ lesson, signedIn, signInPath, offlineSnapshot = false }: { lesson: PublicLesson; signedIn: boolean; signInPath: string; offlineSnapshot?: boolean }) {
  const [section, setSection] = useState<SectionId>("overview");
  const [savedProgress, setSavedProgress] = useState<{ percent: number; bestScore: number; attemptsCount: number } | null>(null);
  const [practicePassed, setPracticePassed] = useState(false);
  const [quizResult, setQuizResult] = useState<GradeResult | null>(null);
  const [savedVocabulary, setSavedVocabulary] = useState<Set<string>>(() => new Set());
  const [savingVocabulary, setSavingVocabulary] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const contentRef = useRef<HTMLElement>(null);
  const sectionChanged = useRef(false);
  const speech = useGermanSpeech();
  const index = sectionMeta.findIndex((item) => item.id === section);
  const percent = section === "complete" ? 100 : Math.round((index / (sectionMeta.length - 1)) * 100);

  useEffect(() => {
    if (!signedIn || offlineSnapshot) return;
    const controller = new AbortController();
    fetch(`/api/v1/lessons/${lesson.id}/progress`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((body: unknown) => {
        const response = body as { data?: { percent: number; bestScore: number; attemptsCount: number } } | null;
        if (response?.data) setSavedProgress(response.data);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [lesson.id, offlineSnapshot, signedIn]);

  useEffect(() => {
    if (!signedIn || offlineSnapshot) return;
    const controller = new AbortController();
    fetch(`/api/v1/me/saved-items?lessonId=${encodeURIComponent(lesson.id)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((body: unknown) => {
        const response = body as { data?: { contentItemId: string }[] } | null;
        if (response?.data) setSavedVocabulary(new Set(response.data.map((item) => item.contentItemId)));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [lesson.id, offlineSnapshot, signedIn]);

  async function toggleVocabulary(contentItemId: string, lemma: string) {
    if (!signedIn || savingVocabulary) return;
    const isSaved = savedVocabulary.has(contentItemId);
    setSavingVocabulary(contentItemId);
    setSaveMessage(null);
    try {
      const outcome = await submitWithOfflineFallback({
        kind: "saved_item",
        entityKey: `saved-item:${contentItemId}`,
        method: isSaved ? "DELETE" : "POST",
        url: isSaved ? `/api/v1/me/saved-items/${encodeURIComponent(contentItemId)}` : "/api/v1/me/saved-items",
        body: isSaved ? undefined : { contentItemId, sourceLessonId: lesson.id },
      });
      setSavedVocabulary((current) => {
        const next = new Set(current);
        if (isSaved) next.delete(contentItemId); else next.add(contentItemId);
        return next;
      });
      setSaveMessage(outcome.state === "queued"
        ? `${lemma} updated on this device. The change will sync when you’re online.`
        : isSaved ? `${lemma} removed from your library.` : `${lemma} saved and ready to review.`);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Your library could not be updated.");
    } finally {
      setSavingVocabulary(null);
    }
  }

  function move(next: SectionId) {
    sectionChanged.current = true;
    setSection(next);
  }

  function next() {
    move(sectionMeta[Math.min(index + 1, sectionMeta.length - 1)].id);
  }

  useEffect(() => {
    if (!sectionChanged.current) return;
    sectionChanged.current = false;
    contentRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [section]);

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 px-4 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3">
          <Link href="/" className="grid size-11 shrink-0 place-items-center rounded-xl border border-border transition hover:bg-muted" aria-label="Back to dashboard"><ArrowLeft className="size-4" aria-hidden="true" /></Link>
          <div className="min-w-0"><p className="truncate text-sm font-bold">{lesson.title}</p><p className="text-xs text-muted-foreground">German {lesson.levelCode} · {lesson.estimatedMinutes} min</p></div>
          <div className="ml-auto flex items-center gap-3">
            {offlineSnapshot ? <Button asChild variant="outline" size="sm" className="rounded-xl"><Link href="/offline">Offline library</Link></Button> : <OfflineDownloadButton lesson={lesson} signedIn={signedIn} />}
            <div className="hidden w-56 md:block"><div className="mb-1 flex justify-between text-[0.68rem] font-bold text-muted-foreground"><span>{sectionMeta[index].label}</span><span>{percent}%</span></div><Progress value={percent} aria-label={`Lesson progress: ${percent} percent`} /></div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:py-10">
        <aside className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Lesson path</p>
          <ol className="mt-4 space-y-1">
            {sectionMeta.map((item, itemIndex) => {
              const complete = itemIndex < index;
              const active = item.id === section;
              const locked = item.id === "complete" && !quizResult?.passed;
              return <li key={item.id}><button type="button" disabled={itemIndex > index || locked} onClick={() => move(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${active ? "bg-accent text-foreground" : complete ? "text-foreground hover:bg-muted" : "text-muted-foreground"}`}><span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs ${complete ? "bg-progress text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{complete ? <Check className="size-3.5" /> : locked ? <LockKeyhole className="size-3" /> : itemIndex + 1}</span>{item.label}</button></li>;
            })}
          </ol>
          {savedProgress && savedProgress.attemptsCount > 0 ? <div className="mt-6 rounded-xl border border-border bg-card p-4 text-xs leading-5 text-muted-foreground"><p className="font-bold text-foreground">Saved progress</p><p>{savedProgress.percent}% complete · best score {savedProgress.bestScore}%</p></div> : null}
        </aside>

        <article ref={contentRef} tabIndex={-1} className="min-w-0 focus:outline-none">
          <div className="mb-6 lg:hidden"><div className="mb-2 flex justify-between text-xs font-bold text-muted-foreground"><span>{sectionMeta[index].label}</span><span>{percent}%</span></div><Progress value={percent} aria-label={`Lesson progress: ${percent} percent`} /></div>
          {section === "overview" ? <Overview lesson={lesson} onContinue={next} /> : null}
          {section === "vocabulary" ? <Vocabulary lesson={lesson} onContinue={next} signedIn={signedIn} signInPath={signInPath} savedVocabulary={savedVocabulary} savingVocabulary={savingVocabulary} saveMessage={saveMessage} speech={speech} onToggleSave={toggleVocabulary} /> : null}
          {section === "sentences" ? <Sentences lesson={lesson} onContinue={next} speech={speech} /> : null}
          {section === "grammar" ? <Grammar lesson={lesson} onContinue={next} /> : null}
          {section === "reading" ? <Reading lesson={lesson} onContinue={next} /> : null}
          {section === "practice" ? <AssessmentSection title="Try it with guidance" eyebrow="Practice · 3 questions" description="Choose an answer for every prompt. You’ll see explanations after submitting." questions={lesson.practice.questions} assessmentType="practice" lessonId={lesson.id} signedIn={signedIn} signInPath={signInPath} onPassed={() => { setPracticePassed(true); next(); }} continueLabel="Continue to quiz" /> : null}
          {section === "quiz" ? <AssessmentSection title="Show what you can do" eyebrow={`${lesson.quiz.title} · ${lesson.quiz.questions.length} questions`} description={`Score ${lesson.quiz.passThreshold}% or higher to complete the lesson. Your attempt is saved to your progress.`} questions={lesson.quiz.questions} assessmentType="quiz" lessonId={lesson.id} signedIn={signedIn} signInPath={signInPath} onPassed={(result) => { setQuizResult(result); move("complete"); }} continueLabel="Complete lesson" /> : null}
          {section === "complete" ? <Completion lesson={lesson} result={quizResult} practiced={practicePassed} /> : null}
        </article>
      </div>
    </main>
  );
}

function LessonHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <><p className="text-sm font-bold text-progress">{eyebrow}</p><h1 className="font-display mt-2 max-w-3xl text-[clamp(2.35rem,6vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.055em]">{title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p></>;
}

function ContinueButton({ onClick, children = "Continue" }: { onClick: () => void; children?: React.ReactNode }) {
  return <div className="mt-8 flex justify-end"><Button size="lg" onClick={onClick} className="h-12 rounded-xl px-6 font-bold">{children}<ArrowRight aria-hidden="true" /></Button></div>;
}

function Overview({ lesson, onContinue }: { lesson: PublicLesson; onContinue: () => void }) {
  return <div><LessonHeading eyebrow={`German ${lesson.levelCode} · Lesson ${lesson.order}`} title={lesson.heroTitle} description={lesson.summary} /><div className="mt-9 grid gap-3 sm:grid-cols-3">{lesson.objectives.map((objective, index) => <div key={objective} className="rounded-2xl border border-border bg-card p-5"><span className="grid size-9 place-items-center rounded-xl bg-accent text-sm font-black text-primary">0{index + 1}</span><p className="mt-5 text-sm font-bold leading-6">{objective}</p></div>)}</div><div className="mt-5 flex items-center gap-3 rounded-2xl bg-ink p-5 text-white"><Sparkles className="size-5 shrink-0 text-[#8fd8bf]" aria-hidden="true" /><p className="text-sm leading-6 text-white/80">Meet each phrase in a realistic exchange, notice one useful pattern, then use it in practice.</p></div><ContinueButton onClick={onContinue}>Start vocabulary</ContinueButton></div>;
}

type GermanSpeech = ReturnType<typeof useGermanSpeech>;

function Vocabulary({ lesson, onContinue, signedIn, signInPath, savedVocabulary, savingVocabulary, saveMessage, speech, onToggleSave }: { lesson: PublicLesson; onContinue: () => void; signedIn: boolean; signInPath: string; savedVocabulary: Set<string>; savingVocabulary: string | null; saveMessage: string | null; speech: GermanSpeech; onToggleSave: (contentItemId: string, lemma: string) => void }) {
  return <div><LessonHeading eyebrow={`Vocabulary · ${lesson.vocabulary.length} words`} title="Start with the essentials." description="Listen, say each word aloud, and save the ones you want to remember. Saved words enter your personal review queue." /><div aria-live="polite" className="mt-5 min-h-5 text-sm font-semibold text-muted-foreground">{speech.message ?? saveMessage}</div><div className="mt-3 grid gap-3">{lesson.vocabulary.map((item, index) => { const saved = savedVocabulary.has(item.id); const active = speech.activeText === item.lemma; return <section key={item.id} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(22,44,52,0.04)] sm:grid-cols-[44px_1fr_auto] sm:items-center"><span className="grid size-11 place-items-center rounded-xl bg-muted text-sm font-black text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><div><h2 className="font-display text-2xl font-bold">{item.lemma}</h2><p className="mt-1 text-sm text-muted-foreground">{item.translation}{item.pronunciation !== "audio" ? ` · /${item.pronunciation}/` : " · audio available"}</p>{"gender" in item.languageFeatures ? <p className="mt-2 text-xs font-semibold text-progress">{item.languageFeatures.gender} · plural: {item.languageFeatures.plural}</p> : null}</div><div className="flex gap-2"><Button variant={active ? "default" : "outline"} size="icon" disabled={active && speech.isBusy} onClick={() => speech.speak(item.lemma)} aria-label={active && speech.isBusy ? `Playing ${item.lemma} in German` : `Hear ${item.lemma} in German`}><SpeechIcon active={active} status={speech.status} /></Button>{signedIn ? <Button variant={saved ? "default" : "outline"} size="icon" disabled={savingVocabulary === item.id} aria-pressed={saved} aria-label={saved ? `Remove ${item.lemma} from library` : `Save ${item.lemma} to library`} onClick={() => onToggleSave(item.id, item.lemma)}><Bookmark aria-hidden="true" className={saved ? "fill-current" : ""} /></Button> : <Button asChild variant="outline" size="icon"><a href={signInPath} target="_top" aria-label={`Sign in to save ${item.lemma}`}><Bookmark aria-hidden="true" /></a></Button>}</div></section>; })}</div><ContinueButton onClick={onContinue}>Continue to phrases</ContinueButton></div>;
}

function Sentences({ lesson, onContinue, speech }: { lesson: PublicLesson; onContinue: () => void; speech: GermanSpeech }) {
  return <div><LessonHeading eyebrow="Useful phrases · in context" title="Say what you need." description="Read the German first. Then open the meaning and usage note to check your understanding." /><p aria-live="polite" className="mt-5 min-h-5 text-sm font-semibold text-muted-foreground">{speech.message}</p><div className="mt-3 space-y-3">{lesson.sentences.map((sentence) => { const active = speech.activeText === sentence.text; return <details key={sentence.id} className="group rounded-2xl border border-border bg-card p-5 open:border-primary/30"><summary className="flex cursor-pointer list-none items-center gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent"><MessageCircleMore className="size-4" /></span><span className="font-display flex-1 text-xl font-bold">{sentence.text}</span><span className="text-xs font-bold text-muted-foreground group-open:hidden">Reveal</span><Check className="hidden size-4 text-progress group-open:block" /></summary><div className="ml-14 mt-4 border-t border-border pt-4"><p className="font-semibold">{sentence.translation}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{sentence.note}</p><Button variant={active ? "secondary" : "ghost"} size="sm" disabled={active && speech.isBusy} onClick={() => speech.speak(sentence.text)} className="mt-2 -ml-3"><SpeechIcon active={active} status={speech.status} />{active && speech.isBusy ? "Playing German…" : "Hear phrase"}</Button></div></details>; })}</div><ContinueButton onClick={onContinue}>Learn the pattern</ContinueButton></div>;
}

function SpeechIcon({ active, status }: { active: boolean; status: GermanSpeech["status"] }) {
  if (active && status === "loading") return <LoaderCircle aria-hidden="true" className="animate-spin" />;
  if (active && status === "speaking") return <Volume2 aria-hidden="true" />;
  return <Headphones aria-hidden="true" />;
}

function Grammar({ lesson, onContinue }: { lesson: PublicLesson; onContinue: () => void }) {
  return <div><LessonHeading eyebrow="Grammar · one useful pattern" title={lesson.grammar.title} description={lesson.grammar.explanation} /><div className="mt-8 rounded-[28px] bg-ink p-6 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.13em] text-white/60">Pattern</p><p className="font-display mt-3 text-2xl font-bold text-white sm:text-3xl">{lesson.grammar.pattern}</p><div className="mt-7 grid gap-3">{lesson.grammar.examples.map((example) => <div key={example.source} className="rounded-2xl bg-white/[0.07] p-4"><p className="font-bold">{example.source}</p><p className="mt-1 text-sm text-white/65">{example.translation}</p></div>)}</div></div><div className="mt-4 flex gap-3 rounded-2xl border border-[#e4b777]/40 bg-[#fff4e4] p-5 text-[#6e4214] dark:bg-[#3a2919] dark:text-[#ffd29b]"><CircleAlert className="mt-0.5 size-5 shrink-0" /><div><p className="font-bold">Sound natural</p><p className="mt-1 text-sm leading-6">{lesson.grammar.commonMistake}</p></div></div><ContinueButton onClick={onContinue}>Read the dialogue</ContinueButton></div>;
}

function Reading({ lesson, onContinue }: { lesson: PublicLesson; onContinue: () => void }) {
  return <div><LessonHeading eyebrow="Reading · mini dialogue" title={lesson.reading.title} description="Follow the exchange, notice how the language works in context, and use the translation only when you need it." /><div className="mt-8 rounded-[28px] border border-border bg-card p-5 sm:p-7">{lesson.reading.lines.map((line, index) => <div key={`${line.speaker}-${index}`} className={`flex gap-4 py-4 ${index ? "border-t border-border" : ""}`}><span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-xs font-black">{line.speaker.slice(0, 1)}</span><div><p className="text-xs font-bold uppercase tracking-wide text-progress">{line.speaker}</p><p className="mt-1 text-base font-bold">{line.text}</p><p className="mt-1 text-sm text-muted-foreground">{line.translation}</p></div></div>)}</div><ContinueButton onClick={onContinue}>Try guided practice</ContinueButton></div>;
}

function AssessmentSection({ title, eyebrow, description, questions, assessmentType, lessonId, signedIn, signInPath, onPassed, continueLabel }: { title: string; eyebrow: string; description: string; questions: readonly PublicChoiceQuestion[]; assessmentType: "practice" | "quiz"; lessonId: string; signedIn: boolean; signInPath: string; onPassed: (result: GradeResult) => void; continueLabel: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GradeResult | null>(null);
  const [queuedAttemptId, setQueuedAttemptId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(new Date().toISOString());
  const complete = questions.every((question) => answers[question.id]);
  const feedback = useMemo(() => new Map(result?.answers.map((answer) => [answer.exerciseId, answer])), [result]);

  useEffect(() => {
    if (!queuedAttemptId) return;
    const handleSyncResult = (event: Event) => {
      const detail = (event as CustomEvent<{ operationId?: string; body?: { data?: GradeResult } }>).detail;
      if (detail?.operationId !== queuedAttemptId || !detail.body?.data) return;
      setResult(detail.body.data);
      setQueuedAttemptId(null);
    };
    window.addEventListener("language-guide-sync-result", handleSyncResult);
    return () => window.removeEventListener("language-guide-sync-result", handleSyncResult);
  }, [queuedAttemptId]);

  async function submit() {
    if (!complete || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const clientOperationId = crypto.randomUUID();
      const outcome = await submitWithOfflineFallback({
        kind: "assessment_attempt",
        entityKey: `attempt:${clientOperationId}`,
        method: "POST",
        url: "/api/v1/attempts",
        operationId: clientOperationId,
        body: { lessonId, assessmentType, clientOperationId, startedAt: startedAt.current, answers: questions.map((question) => ({ exerciseId: question.id, response: answers[question.id] })) },
      });
      if (outcome.state === "queued") {
        setQueuedAttemptId(outcome.operationId);
        return;
      }
      const body = outcome.body as { data?: GradeResult };
      if (!body.data) throw new Error("The server returned an incomplete result.");
      setResult(body.data);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Your attempt could not be saved.");
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setAnswers({});
    setResult(null);
    setQueuedAttemptId(null);
    setError(null);
    startedAt.current = new Date().toISOString();
  }

  return <div><LessonHeading eyebrow={eyebrow} title={title} description={description} />{!signedIn ? <div className="mt-7 rounded-2xl border border-primary/25 bg-accent p-5"><p className="font-bold">Sign in to take this assessment</p><p className="mt-1 text-sm text-muted-foreground">Your answers and progress will be kept across devices.</p><Button asChild className="mt-4"><a href={signInPath} target="_top">Sign in</a></Button></div> : null}<div className="mt-8 space-y-5">{questions.map((question, questionIndex) => { const answerFeedback = feedback.get(question.id); return <fieldset key={question.id} disabled={Boolean(result) || Boolean(queuedAttemptId) || !signedIn} className="rounded-2xl border border-border bg-card p-5 sm:p-6"><legend className="sr-only">Question {questionIndex + 1}</legend><div className="flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-xs font-black">{questionIndex + 1}</span><div><p className="text-xs font-bold uppercase tracking-wide text-progress">{question.instruction}</p><h2 className="font-display mt-1 text-xl font-bold sm:text-2xl">{question.prompt}</h2></div></div><div className="mt-5 grid gap-2">{question.choices.map((choice) => { const selected = answers[question.id] === choice; const isCorrect = answerFeedback?.correctAnswer === choice; const isWrong = Boolean(answerFeedback && selected && !answerFeedback.correct); return <label key={choice} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${isCorrect ? "border-progress bg-accent" : isWrong ? "border-destructive bg-destructive/5" : selected ? "border-primary bg-accent" : "border-border hover:bg-muted/60"}`}><input type="radio" name={question.id} value={choice} checked={selected} onChange={() => setAnswers((current) => ({ ...current, [question.id]: choice }))} className="size-4 accent-[var(--primary)]" /><span>{choice}</span>{isCorrect ? <CheckCircle2 className="ml-auto size-4 text-progress" /> : null}</label>; })}</div>{answerFeedback ? <div className={`mt-4 rounded-xl p-4 text-sm leading-6 ${answerFeedback.correct ? "bg-accent text-foreground" : "bg-destructive/5 text-foreground"}`}><p className="font-bold">{answerFeedback.correct ? "Correct" : `Correct answer: ${answerFeedback.correctAnswer}`}</p><p className="text-muted-foreground">{answerFeedback.explanation}</p></div> : null}</fieldset>; })}</div>{error ? <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</p> : null}{queuedAttemptId ? <div className="mt-6 rounded-2xl border border-primary/25 bg-accent p-5"><p className="font-bold">Attempt saved on this device</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Reconnect to check your answers. The same operation ID prevents this attempt from being saved twice.</p></div> : null}{result ? <div className="mt-6 rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-4"><span className={`grid size-12 place-items-center rounded-full ${result.passed ? "bg-accent text-progress" : "bg-destructive/10 text-destructive"}`}>{result.passed ? <CheckCircle2 /> : <RotateCcw />}</span><div><p className="font-display text-2xl font-bold">{result.score} of {result.maxScore} correct</p><p className="text-sm text-muted-foreground">{result.passed ? "You’re ready for the next step." : "Review the feedback, then try once more."}</p></div></div></div> : null}<div className="mt-8 flex flex-wrap justify-end gap-3">{result && !result.passed ? <Button variant="outline" size="lg" onClick={retry}><RotateCcw />Try again</Button> : null}{result?.passed ? <Button size="lg" onClick={() => onPassed(result)}>{continueLabel}<ArrowRight /></Button> : <Button size="lg" disabled={!signedIn || !complete || submitting || Boolean(queuedAttemptId)} onClick={submit}>{submitting ? "Checking…" : queuedAttemptId ? "Waiting to sync" : "Check answers"}</Button>}</div></div>;
}

function Completion({ lesson, result, practiced }: { lesson: PublicLesson; result: GradeResult | null; practiced: boolean }) {
  return <div className="text-center"><span className="mx-auto grid size-20 place-items-center rounded-[26px] bg-accent text-progress"><Trophy className="size-9" /></span><p className="mt-7 text-sm font-bold text-progress">Lesson complete</p><h1 className="font-display mx-auto mt-2 max-w-2xl text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.95] tracking-[-0.06em]">{lesson.completionTitle}</h1><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">Your quiz result and completion are saved. Come back anytime to replay the lesson and improve your best score.</p><div className="mx-auto mt-9 grid max-w-2xl gap-3 sm:grid-cols-3"><SummaryCard icon={Languages} label="Words met" value={String(lesson.vocabulary.length)} /><SummaryCard icon={BookOpenText} label="Practice" value={practiced ? "Passed" : "Skipped"} /><SummaryCard icon={Trophy} label="Quiz score" value={result ? `${result.percent}%` : "—"} /></div><div className="mt-9 flex flex-wrap justify-center gap-3"><Button variant="outline" asChild size="lg"><Link href="/learn">View course</Link></Button><Button asChild size="lg"><Link href="/">Back to dashboard<ArrowRight /></Link></Button></div></div>;
}

function SummaryCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-card p-5 text-left"><Icon className="size-5 text-progress" /><p className="mt-5 text-xs font-bold text-muted-foreground">{label}</p><p className="font-display mt-1 text-2xl font-bold">{value}</p></div>;
}
