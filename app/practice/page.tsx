import { ArrowLeft, Clock3, Gauge, Sparkles } from "lucide-react";
import { eq } from "drizzle-orm";
import Link from "next/link";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { PracticeArena } from "@/components/practice/practice-arena";
import { Button } from "@/components/ui/button";
import { getDb } from "@/db";
import { enrollments } from "@/db/schema";
import { GERMAN_LEVELS, getPublicPracticeChallenge, isGermanLevel, type GermanLevel } from "@/infrastructure/catalog/lesson-content";

export const dynamic = "force-dynamic";

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const { level: requestedLevel } = await searchParams;
  const user = await getChatGPTUser();
  const level = requestedLevel && isGermanLevel(requestedLevel) ? requestedLevel : await loadActiveLevel(user?.userId);
  const challenge = getPublicPracticeChallenge(dailySeed(), level);

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[980px] items-center justify-between">
          <Link href="/" className="flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft aria-hidden="true" className="size-4" />Dashboard</Link>
          <span className="font-display font-bold">Language Guide</span>
        </div>
      </header>
      <div className="mx-auto max-w-[980px] px-5 py-10 sm:px-8 lg:py-16">
        <div className="flex items-start gap-4">
          <span className="mt-1 hidden size-12 shrink-0 place-items-center rounded-2xl bg-accent text-progress sm:grid"><Sparkles aria-hidden="true" /></span>
          <div>
            <p className="text-sm font-bold text-progress">Daily mixed workout · German {level}</p>
            <h1 className="font-display mt-2 text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.055em]">Turn knowledge into instinct.</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Eight short puzzles mix recall, word order, meaning, and context. Complete every card, then check the whole workout.</p>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-2"><Clock3 aria-hidden="true" className="size-4 text-progress" />About 5 minutes</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-2"><Gauge aria-hidden="true" className="size-4 text-progress" />Pass at {challenge.passThreshold}%</span>
        </div>
        <nav aria-label="Practice level" className="mt-5 flex flex-wrap gap-2">
          {GERMAN_LEVELS.map((option) => <Button key={option} asChild size="sm" variant={level === option ? "default" : "outline"}><Link href={`/practice?level=${option}`} aria-current={level === option ? "page" : undefined}>German {option}</Link></Button>)}
        </nav>
        <PracticeArena challenge={challenge} signedIn={Boolean(user)} />
      </div>
    </main>
  );
}

function dailySeed() {
  return `daily-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}`;
}

async function loadActiveLevel(userId: string | undefined): Promise<GermanLevel> {
  if (!userId) return "A1";
  try {
    const [enrollment] = await getDb().select({ level: enrollments.currentLevelCode }).from(enrollments).where(eq(enrollments.userId, userId)).limit(1);
    return enrollment?.level && isGermanLevel(enrollment.level) ? enrollment.level : "A1";
  } catch (error) {
    console.error("Failed to load active German practice level", error);
    return "A1";
  }
}
