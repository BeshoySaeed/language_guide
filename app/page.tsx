import {
  BookOpen,
  ChevronRight,
  Flame,
  Headphones,
  Home,
  Library,
  MessageCircleMore,
  MoreHorizontal,
  Search,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

const navigation = [
  { label: "Home", icon: Home, active: true },
  { label: "Learn", icon: BookOpen },
  { label: "Practice", icon: Sparkles },
  { label: "Review", icon: Target, count: 18 },
  { label: "Library", icon: Library },
];

const week = [
  { day: "M", done: true },
  { day: "T", done: true },
  { day: "W", done: true },
  { day: "T", done: true },
  { day: "F", done: true },
  { day: "S", done: false },
  { day: "S", done: false },
];

export default async function HomePage() {
  const user = await getChatGPTUser();
  const firstName = user?.fullName?.split(" ")[0] ?? "Bishoy";
  const todayLabel = new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Cairo" }).format(new Date());

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground lg:pb-0">
      <div className="mx-auto grid min-h-screen max-w-[1540px] grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border bg-sidebar px-5 py-7 lg:flex lg:flex-col">
          <Link className="flex items-center gap-3 px-2" href="/" aria-label="Language Guide home">
            <span className="grid size-10 place-items-center rounded-[14px] bg-primary text-lg font-black text-primary-foreground shadow-sm">L</span>
            <span className="font-display text-[1.1rem] font-bold tracking-[-0.03em]">Language Guide</span>
          </Link>

          <nav aria-label="Primary" className="mt-11 space-y-1.5">
            {navigation.map(({ label, icon: Icon, active, count }) => (
              <Link
                key={label}
                href={label === "Home" ? "/" : `/${label.toLowerCase()}`}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] font-semibold transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
                }`}
              >
                <Icon aria-hidden="true" className="size-[19px]" strokeWidth={1.9} />
                <span>{label}</span>
                {count ? <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{count}</span> : null}
              </Link>
            ))}
          </nav>

          <section className="mt-auto rounded-2xl border border-border bg-card p-4 shadow-[0_8px_24px_rgba(26,42,48,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Weekly goal</span>
              <span className="text-xs font-semibold text-muted-foreground">5 / 7 days</span>
            </div>
            <div className="mt-4 flex justify-between">
              {week.map((item, index) => (
                <div className="grid gap-1.5 text-center" key={`${item.day}-${index}`}>
                  <span className={`grid size-6 place-items-center rounded-full text-[0.68rem] font-bold ${item.done ? "bg-progress text-white" : "bg-muted text-muted-foreground"}`}>
                    {item.done ? "✓" : "·"}
                  </span>
                  <span className="text-[0.68rem] font-semibold text-muted-foreground">{item.day}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <div className="min-w-0">
          <header className="flex h-[76px] items-center gap-3 border-b border-border/80 px-5 sm:px-8 xl:px-12">
            <Link className="flex items-center gap-2 lg:hidden" href="/" aria-label="Language Guide home">
              <span className="grid size-9 place-items-center rounded-xl bg-primary font-black text-primary-foreground">L</span>
            </Link>
            <Link href="/search" className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-card px-3.5 text-left shadow-xs transition hover:border-primary/30 sm:w-[290px]" aria-label="Search vocabulary, lessons, and grammar">
              <Search aria-hidden="true" className="size-4 text-muted-foreground" />
              <span className="hidden text-sm text-muted-foreground sm:inline">Search words, lessons, grammar…</span>
              <span className="ml-auto hidden rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground sm:inline">⌘ K</span>
            </Link>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Link href="/learn" className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-bold shadow-xs" aria-label="Current learning language: German">
                <span aria-hidden="true">🇩🇪</span>
                <span className="hidden sm:inline">German</span>
                <ChevronRight aria-hidden="true" className="size-3.5 rotate-90 text-muted-foreground" />
              </Link>
              <button type="button" className="grid size-11 place-items-center rounded-full bg-ink text-sm font-bold text-white" aria-label="Open profile">
                {firstName.slice(0, 1).toUpperCase()}
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 lg:py-10 xl:px-12">
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="mb-1 text-sm font-bold text-progress">{todayLabel}</p>
                <h1 className="font-display text-[clamp(2rem,4vw,3.35rem)] font-bold leading-[1.04] tracking-[-0.055em]">Good evening, {firstName}.</h1>
                <p className="mt-2 text-base text-muted-foreground">Your next German lesson is ready when you are.</p>
              </div>
              <div className="flex items-center gap-2 self-start rounded-full bg-streak-soft px-3.5 py-2 text-sm font-bold text-streak sm:self-auto">
                <Flame aria-hidden="true" className="size-4 fill-current" />
                12 day streak
              </div>
            </section>

            <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(310px,0.85fr)]">
              <article className="relative overflow-hidden rounded-[28px] bg-ink p-6 text-white shadow-[0_22px_60px_rgba(13,33,39,0.18)] sm:p-8">
                <div className="absolute -right-14 -top-24 size-72 rounded-full border-[52px] border-white/[0.055]" aria-hidden="true" />
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/65">
                    <span>German A1</span><span aria-hidden="true">•</span><span>Foundations</span>
                  </div>
                  <div className="mt-8 max-w-xl">
                    <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">Lesson 4 of 12</span>
                    <h2 className="font-display mt-4 text-[clamp(2rem,5vw,3.8rem)] font-bold leading-[0.98] tracking-[-0.055em]">At the bakery</h2>
                    <p className="mt-4 max-w-md text-[0.98rem] leading-7 text-white/70">Order breakfast, ask about prices, and use polite requests with confidence.</p>
                  </div>
                  <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <div className="mb-2 flex justify-between text-xs font-bold text-white/65"><span>Chapter progress</span><span>62%</span></div>
                      <Progress value={62} aria-label="Chapter progress: 62 percent" className="h-2.5 bg-white/15 [&_[data-slot=progress-indicator]]:bg-progress" />
                    </div>
                    <Button asChild size="lg" className="h-12 rounded-xl bg-white px-5 font-bold text-ink hover:bg-white/90">
                      <Link href="/learn/de/a1/at-the-bakery">Continue lesson<ChevronRight aria-hidden="true" /></Link>
                    </Button>
                  </div>
                </div>
              </article>

              <article className="rounded-[28px] border border-border bg-card p-6 shadow-[0_14px_40px_rgba(22,44,52,0.07)] sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-sm font-bold text-progress">Today&apos;s review</p><h2 className="font-display mt-1 text-2xl font-bold tracking-[-0.04em]">18 items due</h2></div>
                  <button type="button" className="grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Review options"><MoreHorizontal aria-hidden="true" className="size-5" /></button>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-muted/70 p-3.5"><span className="grid size-10 place-items-center rounded-xl bg-card text-lg shadow-xs" aria-hidden="true">Aa</span><div><p className="text-sm font-bold">Vocabulary</p><p className="text-xs text-muted-foreground">12 words</p></div><span className="ml-auto text-sm font-bold">8 min</span></div>
                  <div className="flex items-center gap-3 rounded-2xl bg-muted/70 p-3.5"><span className="grid size-10 place-items-center rounded-xl bg-card shadow-xs" aria-hidden="true"><MessageCircleMore className="size-4" /></span><div><p className="text-sm font-bold">Sentences</p><p className="text-xs text-muted-foreground">6 phrases</p></div><span className="ml-auto text-sm font-bold">5 min</span></div>
                </div>
                <Button variant="outline" className="mt-5 h-11 w-full rounded-xl font-bold">Start 13-minute review</Button>
              </article>
            </section>

            <section className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <div><p className="text-sm font-bold text-progress">Your rhythm</p><h2 className="font-display text-2xl font-bold tracking-[-0.04em]">Today at a glance</h2></div>
                <Link href="/progress" className="text-sm font-bold text-primary hover:underline">View progress</Link>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Daily goal", value: "24 / 30", note: "minutes", icon: Target },
                  { label: "Words learned", value: "284", note: "+12 this week", icon: BookOpen },
                  { label: "Listening", value: "76%", note: "on track", icon: Headphones },
                  { label: "Best quiz", value: "92%", note: "Personal best", icon: Trophy },
                ].map(({ label, value, note, icon: Icon }) => (
                  <article key={label} className="rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(22,44,52,0.045)]">
                    <div className="flex items-center justify-between"><p className="text-sm font-semibold text-muted-foreground">{label}</p><Icon aria-hidden="true" className="size-[18px] text-progress" /></div>
                    <p className="font-display mt-4 text-3xl font-bold tracking-[-0.045em]">{value}</p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">{note}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-2xl border border-border bg-card/95 p-1.5 shadow-[0_16px_45px_rgba(7,24,29,0.2)] backdrop-blur lg:hidden">
        {[
          { label: "Home", href: "/", icon: Home },
          { label: "Learn", href: "/learn", icon: BookOpen },
          { label: "Review", href: "/review", icon: Target },
          { label: "Library", href: "/library", icon: Library },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href} aria-current={label === "Home" ? "page" : undefined} className={`grid min-h-12 place-items-center rounded-xl text-[0.68rem] font-bold ${label === "Home" ? "bg-accent text-foreground" : "text-muted-foreground"}`}>
            <Icon className="size-[18px]" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
