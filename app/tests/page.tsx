import { ArrowLeft, ArrowRight, CheckCircle2, Headphones, Languages, ListChecks } from "lucide-react";
import Link from "next/link";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { Button } from "@/components/ui/button";
import { getPublicGermanLevelAssessment } from "@/infrastructure/catalog/level-assessment";
import { GERMAN_LEVELS, listPublicLessons } from "@/infrastructure/catalog/lesson-content";

export const dynamic = "force-dynamic";

export default async function TestsPage() {
  const user = await getChatGPTUser();
  return <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card/90 px-5 py-4 sm:px-8"><div className="mx-auto flex max-w-[1080px] items-center justify-between"><Link href="/" className="flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="size-4" />Dashboard</Link><span className="font-display font-bold">Level tests</span></div></header>
    <div className="mx-auto max-w-[1080px] px-5 py-10 sm:px-8 lg:py-16">
      <p className="text-sm font-bold text-progress">German checkpoints</p>
      <h1 className="font-display mt-2 text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.95] tracking-[-0.06em]">See what you can use.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Results identify strong areas and lessons worth revisiting. The A1 final includes writing and microphone-supported speaking in addition to recognition skills.</p>
      <div className="mt-9 grid gap-4 md:grid-cols-3">{GERMAN_LEVELS.map((level) => {
        const assessment = getPublicGermanLevelAssessment(level);
        return <article key={level} className="rounded-[26px] border border-border bg-card p-6 shadow-[0_10px_30px_rgba(22,44,52,0.05)]">
          <div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-accent font-display text-lg font-bold text-progress">{level}</span><span className="text-xs font-bold text-muted-foreground">{listPublicLessons(level).length} lessons</span></div>
          <h2 className="font-display mt-6 text-2xl font-bold">German {level} test</h2>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground"><p className="flex items-center gap-2"><ListChecks className="size-4 text-progress" />{assessment.questions.length} scored questions</p><p className="flex items-center gap-2"><Headphones className="size-4 text-progress" />{level === "A1" ? "Seven skill areas" : "Listening included"}</p><p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-progress" />Pass at {assessment.passThreshold}%</p></div>
          <Button asChild className="mt-6 w-full"><Link href={`/tests/${level.toLowerCase()}`}>Start {level} test<ArrowRight /></Link></Button>
        </article>;
      })}</div>
      {!user ? <div className="mt-7 flex items-start gap-3 rounded-2xl border border-border bg-card p-5"><Languages className="mt-0.5 size-5 text-progress" /><p className="text-sm leading-6 text-muted-foreground">Tests work without an account. Sign in before starting if you want the result saved to your progress history.</p></div> : null}
    </div>
  </main>;
}
