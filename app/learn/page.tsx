import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Clock3, CloudOff, LockKeyhole, Sparkles } from "lucide-react";
import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LanguageSelector } from "@/components/learn/language-selector";
import { getDb } from "@/db";
import { enrollments, lessonProgress, levelAssessmentResults } from "@/db/schema";
import { getLanguageCatalog } from "@/packages/application/src/get-language-catalog";
import { languageRepository } from "@/infrastructure/catalog/configured-language-repository";
import { GERMAN_LEVELS, getGermanCourse, isGermanLevel, listPublicLessons, type GermanLevel } from "@/infrastructure/catalog/lesson-content";
import { calculateLessonAccess } from "@/packages/domain/src/curriculum-progression";
import { evaluateA1Readiness, type A1Readiness } from "@/packages/domain/src/a1-readiness";
import type { LevelAssessmentSkill } from "@/packages/domain/src/level-assessment";
import { countDueReviews } from "@/infrastructure/learning/personal-library";

export const dynamic = "force-dynamic";

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ level?: string; locked?: string }> }) {
  const { level: requestedLevel, locked } = await searchParams;
  const [user, languages] = await Promise.all([getChatGPTUser(), getLanguageCatalog(languageRepository)]);
  const activeLevel = await resolveLevel(requestedLevel, user?.userId);
  const course = getGermanCourse(activeLevel);
  const lessons = listPublicLessons(activeLevel);
  const progressRows = user ? await loadCourseProgress(user.userId) : [];
  const a1Readiness = user && activeLevel === "A1" ? await loadA1Readiness(user.userId, progressRows) : null;
  const progressByLesson = new Map(progressRows.map((row) => [row.lessonId, row]));
  const accessByLesson = new Map(calculateLessonAccess(lessons.map((lesson) => lesson.id), progressRows, Boolean(user)).map((access) => [access.lessonId, access]));
  const completedLessons = lessons.filter((lesson) => progressByLesson.get(lesson.id)?.state === "completed").length;
  const coursePercent = Math.round(lessons.reduce((total, lesson) => total + (progressByLesson.get(lesson.id)?.percent ?? 0), 0) / lessons.length);
  const chapters = course.chapters.map((chapter) => {
    const chapterLessons = lessons.filter((lesson) => lesson.chapterId === chapter.id);
    const completed = chapterLessons.filter((lesson) => progressByLesson.get(lesson.id)?.state === "completed").length;
    const percent = Math.round(chapterLessons.reduce((total, lesson) => total + (progressByLesson.get(lesson.id)?.percent ?? 0), 0) / chapterLessons.length);
    return { ...chapter, lessons: chapterLessons, completed, percent };
  });
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4">
          <Link href="/" className="flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="size-4" aria-hidden="true" />Dashboard</Link>
          <div className="flex items-center gap-4">{activeLevel === "A1" ? <Link href="/vocabulary" className="text-sm font-bold text-muted-foreground transition hover:text-foreground">A1 word bank</Link> : null}<Link href="/offline" className="flex min-h-11 items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-foreground"><CloudOff className="size-4" aria-hidden="true" />Offline lessons</Link></div>
        </div>
      </header>
      <div className="mx-auto max-w-[1180px] px-5 py-9 sm:px-8 lg:py-12">
        {locked ? <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/25 bg-accent p-4 text-sm"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-progress" aria-hidden="true" /><p><strong>Complete the previous lesson first.</strong> Your course sequence keeps new material connected to what you have already practiced.</p></div> : null}
        <section>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-sm font-bold text-progress">German {activeLevel} · {levelLabel(activeLevel)}</p><h1 className="font-display mt-2 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.06em]">{course.title}</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{course.description}</p></div>
            <div className="w-full rounded-2xl border border-border bg-card p-4 sm:w-64"><div className="flex justify-between text-sm font-bold"><span>Course progress</span><span>{completedLessons} / {lessons.length}</span></div><Progress value={coursePercent} className="mt-3" aria-label={`Course progress: ${coursePercent} percent`} /></div>
          </div>

          {activeLevel === "A1" ? <A1ReadinessPanel readiness={a1Readiness} signedIn={Boolean(user)} lessons={lessons} /> : null}

          <div className="mt-10 grid gap-12">
            {chapters.map((chapter, chapterIndex) => (
              <section key={chapter.id} aria-labelledby={`${chapter.id}-title`}>
                <div className="mb-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-end">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-progress">Chapter {chapterIndex + 1}</p>
                    <h2 id={`${chapter.id}-title`} className="font-display mt-1 text-3xl font-bold tracking-[-0.045em]">{chapter.title}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{chapter.description}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-muted-foreground"><span>{chapter.completed} of {chapter.lessons.length} complete</span><span>{chapter.percent}%</span></div>
                    <Progress value={chapter.percent} className="mt-2" aria-label={`${chapter.title} progress: ${chapter.percent} percent`} />
                  </div>
                </div>
                <ol className="grid gap-4">
                  {chapter.lessons.map((lesson) => {
                    const progress = progressByLesson.get(lesson.id);
                    const access = accessByLesson.get(lesson.id);
                    const complete = progress?.state === "completed";
                    const started = Boolean(progress && progress.percent > 0);
                    const isLocked = access?.unlocked === false;
                    const prerequisite = access?.prerequisiteLessonId ? lessons.find((candidate) => candidate.id === access.prerequisiteLessonId) : null;
                    return <li key={lesson.id} className={`group grid gap-5 rounded-[26px] border bg-card p-5 shadow-[0_10px_30px_rgba(22,44,52,0.045)] sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-center sm:p-6 ${access?.recommended ? "border-primary/45 ring-2 ring-primary/10" : "border-border"}`}><span className={`grid size-14 place-items-center rounded-2xl font-display text-xl font-bold ${complete ? "bg-progress text-white" : isLocked ? "bg-muted text-muted-foreground" : "bg-muted text-foreground"}`}>{complete ? <Check className="size-6" /> : isLocked ? <LockKeyhole className="size-5" /> : String(lesson.chapterLessonOrder).padStart(2, "0")}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-2xl font-bold tracking-[-0.035em]">{lesson.title}</h3>{complete ? <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-progress">Completed</span> : null}{access?.recommended ? <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">Recommended next</span> : null}{isLocked ? <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">Locked</span> : null}</div><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{lesson.summary}</p><div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{lesson.estimatedMinutes} min</span><span>{lesson.vocabulary.length} words</span><span>{lesson.quiz.questions.length} quiz questions</span>{isLocked && prerequisite ? <span>Complete {prerequisite.title} first</span> : null}</div></div>{isLocked ? <Button disabled variant="outline" className="w-full sm:w-auto"><LockKeyhole />Locked</Button> : <Button asChild variant={complete ? "outline" : "default"} className="w-full sm:w-auto"><Link href={`/learn/de/${activeLevel.toLowerCase()}/${lesson.slug}`}>{complete ? "Review" : started ? "Continue" : "Start"}<ArrowRight /></Link></Button>}</li>;
                  })}
                </ol>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-12 flex flex-col gap-5 rounded-[28px] bg-ink p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10"><ClipboardCheck className="size-5" /></span><div><p className="text-sm font-bold text-white/65">German {activeLevel} checkpoint</p><h2 className="font-display mt-1 text-2xl font-bold">Test {activeLevel === "A1" ? "all seven" : "all five"} skills.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/65">{activeLevel === "A1" ? "Vocabulary, sentences, grammar, reading, listening, writing, and speaking—with a 70% floor in every skill." : "Vocabulary, sentences, grammar, reading, and listening with focused recommendations after the result."}</p></div></div>
          <Button asChild size="lg" className="shrink-0 bg-white text-ink hover:bg-white/90"><Link href={`/tests/${activeLevel.toLowerCase()}`}>Take level test<ArrowRight /></Link></Button>
        </section>

        <details className="mt-12 rounded-[28px] border border-border bg-card p-5 sm:p-7">
          <summary className="flex cursor-pointer list-none items-center gap-3 font-bold"><span className="grid size-10 place-items-center rounded-xl bg-accent text-progress"><Sparkles className="size-4" /></span><span>Change German level</span><span className="ml-auto text-sm text-muted-foreground">A1 · A2 · B1</span></summary>
          <div className="mt-8 border-t border-border pt-8"><LanguageSelector key={activeLevel} languages={languages} initialLevel={activeLevel} lessonCounts={Object.fromEntries(GERMAN_LEVELS.map((level) => [level, listPublicLessons(level).length])) as Record<GermanLevel, number>} signedIn={Boolean(user)} /></div>
        </details>
      </div>
    </main>
  );
}

async function resolveLevel(requestedLevel: string | undefined, userId: string | undefined): Promise<GermanLevel> {
  if (requestedLevel && isGermanLevel(requestedLevel)) return requestedLevel;
  if (!userId) return "A1";
  try {
    const [enrollment] = await getDb().select({ level: enrollments.currentLevelCode }).from(enrollments).where(eq(enrollments.userId, userId)).limit(1);
    return enrollment?.level && isGermanLevel(enrollment.level) ? enrollment.level : "A1";
  } catch (error) {
    console.error("Failed to load active German level", error);
    return "A1";
  }
}

function levelLabel(level: GermanLevel) {
  return ({ A1: "Foundations", A2: "Everyday connections", B1: "Independent use" } as const)[level];
}

async function loadCourseProgress(userId: string) {
  try {
    return await getDb().select().from(lessonProgress).where(eq(lessonProgress.userId, userId));
  } catch (error) {
    console.error("Failed to load course progress", error);
    return [];
  }
}

async function loadA1Readiness(userId: string, progress: Awaited<ReturnType<typeof loadCourseProgress>>): Promise<A1Readiness | null> {
  try {
    const lessons = listPublicLessons("A1");
    const [[latest], dueReviewCount] = await Promise.all([
      getDb().select().from(levelAssessmentResults).where(and(eq(levelAssessmentResults.userId, userId), eq(levelAssessmentResults.levelCode, "A1"))).orderBy(desc(levelAssessmentResults.completedAt)).limit(1),
      countDueReviews(userId),
    ]);
    return evaluateA1Readiness({
      requiredLessonIds: lessons.map((lesson) => lesson.id),
      lessonProgress: progress,
      assessment: latest ? { percent: latest.overallPercent, passed: latest.passed, skills: latest.skills as readonly { skill: LevelAssessmentSkill; percent: number }[] } : null,
      dueReviewCount,
    });
  } catch (error) {
    console.error("Failed to load A1 readiness", error);
    return null;
  }
}

function A1ReadinessPanel({ readiness, signedIn, lessons }: { readiness: A1Readiness | null; signedIn: boolean; lessons: ReturnType<typeof listPublicLessons> }) {
  if (!signedIn) return <section className="mt-9 rounded-[28px] border border-border bg-card p-6 sm:p-8"><p className="text-sm font-bold text-progress">A1 mastery path</p><h2 className="font-display mt-1 text-2xl font-bold">Sign in to verify when you are ready for A2.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Readiness combines all lesson quizzes, the seven-skill A1 final, and your due review queue—not only a completion percentage.</p></section>;
  if (!readiness) return <section className="mt-9 rounded-[28px] border border-border bg-card p-6"><p className="font-bold">A1 readiness is temporarily unavailable.</p><p className="mt-1 text-sm text-muted-foreground">Your lessons remain available and progress is still saved.</p></section>;
  const firstReview = lessons.find((lesson) => lesson.id === readiness.reviewLessonIds[0]);
  const action = readiness.nextAction === "continue_lessons" || readiness.nextAction === "strengthen_quizzes"
    ? { label: firstReview ? `Review ${firstReview.title}` : "Continue A1", href: firstReview ? `/learn/de/a1/${firstReview.slug}` : "/learn?level=A1" }
    : readiness.nextAction === "take_assessment" ? { label: "Take the A1 final", href: "/tests/a1" }
      : readiness.nextAction === "review_skills" ? { label: "Review and retry final", href: "/tests/a1" }
        : readiness.nextAction === "clear_review" ? { label: `Review ${readiness.dueReviewCount} due item${readiness.dueReviewCount === 1 ? "" : "s"}`, href: "/review" }
          : { label: "Start A2", href: "/learn?level=A2" };
  return <section className={`mt-9 rounded-[28px] border p-6 sm:p-8 ${readiness.ready ? "border-progress/40 bg-accent" : "border-border bg-card"}`}>
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-bold text-progress">A1 mastery path</p><h2 className="font-display mt-1 text-2xl font-bold">{readiness.ready ? "Your measured A1 foundation is ready for A2." : "Build evidence before moving to A2."}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{readiness.completedLessons}/{readiness.requiredLessons} lessons complete · {readiness.masteredLessons}/{readiness.requiredLessons} quizzes at 80%+ · final {readiness.assessmentPercent === null ? "not taken" : `${readiness.assessmentPercent}%`} · {readiness.dueReviewCount} reviews due</p></div><Button asChild><Link href={action.href}>{action.label}<ArrowRight /></Link></Button></div>
    <ul className="mt-5 grid gap-2 sm:grid-cols-2">{readiness.requirements.map((requirement) => <li key={requirement.id} className="flex items-center gap-2 text-sm font-semibold"><span className={`grid size-6 place-items-center rounded-full ${requirement.met ? "bg-progress text-white" : "bg-muted text-muted-foreground"}`}>{requirement.met ? <Check className="size-3.5" /> : "·"}</span>{requirement.label}</li>)}</ul>
    {readiness.weakSkills.length ? <p className="mt-4 text-sm font-semibold text-destructive">Needs more practice: {readiness.weakSkills.join(", ")}.</p> : null}
  </section>;
}
