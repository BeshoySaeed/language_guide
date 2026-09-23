import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Clock3,
  Flame,
  History,
  Languages,
  MessageCircleMore,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  emptyProgressSummary,
  loadProgressSummary,
  type ProgressSummary,
  type RecentLearningActivity,
} from "@/infrastructure/learning/progress-summary";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await getChatGPTUser();
  const now = new Date();
  const summary = user ? await safelyLoadProgress(user.userId, now) : emptyProgressSummary(now);
  const goalPercent = Math.min(100, Math.round((summary.todayTrackedMinutes / summary.dailyGoalMinutes) * 100));

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/80 bg-card/80 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-6xl items-center gap-3 px-5 sm:px-8">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/" aria-label="Back to dashboard"><ArrowLeft aria-hidden="true" /></Link>
          </Button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-progress">Progress</p>
            <p className="font-display text-lg font-bold tracking-[-0.03em]">Your learning record</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        {!user ? (
          <section className="overflow-hidden rounded-[30px] bg-ink p-7 text-white shadow-[0_24px_70px_rgba(13,33,39,0.18)] sm:p-10">
            <div className="max-w-2xl">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/10"><History aria-hidden="true" /></span>
              <h1 className="font-display mt-6 text-[clamp(2.3rem,7vw,4.8rem)] font-bold leading-[0.96] tracking-[-0.06em]">Progress belongs to your account.</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/70">Sign in to see completed lessons, saved vocabulary, reviews, quiz scores, active days, and time recorded by finished activities. We do not show sample numbers as your progress.</p>
              <Button asChild size="lg" className="mt-7 h-12 rounded-xl bg-white px-5 font-bold text-ink hover:bg-white/90">
                <a href={chatGPTSignInPath("/progress")} target="_top">Sign in to view progress<ArrowRight aria-hidden="true" /></a>
              </Button>
            </div>
          </section>
        ) : (
          <>
            <section className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
              <article className="overflow-hidden rounded-[30px] bg-ink p-7 text-white shadow-[0_24px_70px_rgba(13,33,39,0.18)] sm:p-9">
                <p className="text-sm font-bold text-progress">Your real learning record</p>
                <h1 className="font-display mt-2 max-w-2xl text-[clamp(2.3rem,6vw,4.7rem)] font-bold leading-[0.96] tracking-[-0.06em]">
                  {summary.currentStreak ? `${summary.currentStreak} active ${summary.currentStreak === 1 ? "day" : "days"}.` : "Start with one recorded activity."}
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-white/70">Only completed lessons and recorded practice, quiz, workout, and review events count here.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="h-12 rounded-xl bg-white px-5 font-bold text-ink hover:bg-white/90">
                    <Link href="/learn">Continue learning<ArrowRight aria-hidden="true" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-white/20 bg-white/5 px-5 font-bold text-white hover:bg-white/10 hover:text-white">
                    <Link href="/practice">Practice now</Link>
                  </Button>
                </div>
              </article>

              <article className="rounded-[30px] border border-border bg-card p-7 shadow-[0_14px_40px_rgba(22,44,52,0.07)]">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-sm font-bold text-progress">Today&apos;s goal</p><p className="font-display mt-1 text-4xl font-bold tracking-[-0.05em]">{summary.todayTrackedMinutes} <span className="text-lg text-muted-foreground">/ {summary.dailyGoalMinutes} min</span></p></div>
                  <span className="grid size-11 place-items-center rounded-2xl bg-accent text-progress"><Target aria-hidden="true" /></span>
                </div>
                <Progress value={goalPercent} aria-label={`${goalPercent} percent of today's goal`} className="mt-7 h-3" />
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{summary.todayActions ? `${summary.todayActions} completed ${summary.todayActions === 1 ? "activity" : "activities"} today.` : "No activity recorded today yet."} Timed minutes come from finished assessments and workouts.</p>
              </article>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric icon={BookOpenCheck} label="Lessons completed" value={summary.lessonsCompleted} note="Completed lesson records" />
              <Metric icon={Languages} label="Words saved" value={summary.wordsSaved} note={`${summary.wordsMastered} mastered`} />
              <Metric icon={MessageCircleMore} label="Reviews completed" value={summary.reviewsCompleted} note="Recorded review answers" />
              <Metric icon={Trophy} label="Best lesson quiz" value={summary.bestQuizScore ? `${summary.bestQuizScore}%` : "—"} note={summary.bestQuizScore ? "Personal best" : "No quiz completed"} />
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)]">
              <article className="rounded-[28px] border border-border bg-card p-6 shadow-[0_10px_32px_rgba(22,44,52,0.05)] sm:p-7">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div><p className="text-sm font-bold text-progress">This week</p><h2 className="font-display mt-1 text-2xl font-bold tracking-[-0.04em]">{summary.activeDaysThisWeek} active {summary.activeDaysThisWeek === 1 ? "day" : "days"}</h2></div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-streak-soft px-3 py-2 text-sm font-bold text-streak"><Flame aria-hidden="true" className="size-4 fill-current" />{summary.currentStreak} day streak</span>
                </div>
                <div className="mt-7 grid grid-cols-7 gap-2">
                  {summary.week.map((day) => (
                    <div key={day.dateKey} className="text-center">
                      <span className={`mx-auto grid aspect-square w-full max-w-12 place-items-center rounded-2xl text-sm font-bold ${day.active ? "bg-progress text-white" : "bg-muted text-muted-foreground"}`} aria-label={`${day.dateKey}: ${day.actions} recorded activities`}>{day.active ? day.actions : "·"}</span>
                      <span className="mt-2 block text-xs font-bold text-muted-foreground">{day.label}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm text-muted-foreground">A day is active when at least one learning action is recorded in {summary.timeZone.replace("_", " ")}.</p>
              </article>

              <article className="rounded-[28px] border border-border bg-card p-6 shadow-[0_10px_32px_rgba(22,44,52,0.05)] sm:p-7">
                <p className="text-sm font-bold text-progress">All-time practice</p>
                <div className="mt-4 flex items-end gap-3"><p className="font-display text-5xl font-bold tracking-[-0.05em]">{summary.practiceSessions}</p><p className="pb-1 text-sm font-semibold text-muted-foreground">finished sessions</p></div>
                <div className="mt-6 flex items-center gap-3 rounded-2xl bg-muted/70 p-4"><Clock3 aria-hidden="true" className="size-5 text-progress" /><div><p className="text-sm font-bold">{summary.totalTrackedMinutes} tracked minutes</p><p className="text-xs text-muted-foreground">Based on recorded session durations</p></div></div>
              </article>
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)]">
              <article className="rounded-[28px] border border-border bg-card p-6 shadow-[0_10px_32px_rgba(22,44,52,0.05)] sm:p-7">
                <div className="flex items-center justify-between"><div><p className="text-sm font-bold text-progress">History</p><h2 className="font-display mt-1 text-2xl font-bold tracking-[-0.04em]">Recent activity</h2></div><History aria-hidden="true" className="text-muted-foreground" /></div>
                {summary.recentActivity.length ? (
                  <div className="mt-5 divide-y divide-border">
                    {summary.recentActivity.map((activity) => <ActivityRow key={`${activity.kind}-${activity.id}`} activity={activity} timeZone={summary.timeZone} />)}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl bg-muted/70 p-5"><p className="font-bold">Nothing recorded yet</p><p className="mt-1 text-sm text-muted-foreground">Complete a lesson activity, workout, or review and it will appear here.</p></div>
                )}
              </article>

              <article className="rounded-[28px] border border-border bg-accent/60 p-6 sm:p-7">
                <span className="grid size-11 place-items-center rounded-2xl bg-card text-progress shadow-xs"><Sparkles aria-hidden="true" /></span>
                <h2 className="font-display mt-5 text-2xl font-bold tracking-[-0.04em]">How counting works</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                  <li>• Streaks use consecutive calendar days with recorded activity.</li>
                  <li>• Today and this week use your saved timezone.</li>
                  <li>• Minutes use actual finished-session duration, not estimated study time.</li>
                  <li>• Quiz best includes lesson quizzes only, not unrelated practice scores.</li>
                </ul>
              </article>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value: number | string; note: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(22,44,52,0.045)]">
      <div className="flex items-center justify-between"><p className="text-sm font-semibold text-muted-foreground">{label}</p><Icon aria-hidden="true" className="size-[18px] text-progress" /></div>
      <p className="font-display mt-4 text-3xl font-bold tracking-[-0.045em]">{value}</p>
      <p className="mt-1 text-xs font-semibold text-muted-foreground">{note}</p>
    </article>
  );
}

function ActivityRow({ activity, timeZone }: { activity: RecentLearningActivity; timeZone: string }) {
  const Icon = activity.kind === "review" ? MessageCircleMore : activity.kind === "challenge" ? Sparkles : Trophy;
  return (
    <div className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-progress"><Icon aria-hidden="true" className="size-4" /></span>
      <div className="min-w-0"><p className="truncate text-sm font-bold">{activity.title}</p><p className="text-xs text-muted-foreground">{activity.detail}</p></div>
      <time className="ml-auto shrink-0 text-xs font-semibold text-muted-foreground" dateTime={activity.occurredAt}>{formatActivityDate(activity.occurredAt, timeZone)}</time>
    </div>
  );
}

function formatActivityDate(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone }).format(new Date(value));
}

async function safelyLoadProgress(userId: string, now: Date): Promise<ProgressSummary> {
  try {
    return await loadProgressSummary(userId, now);
  } catch (error) {
    console.error("Failed to load progress summary", error);
    return emptyProgressSummary(now);
  }
}
