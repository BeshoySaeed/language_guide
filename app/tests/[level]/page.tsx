import { ArrowLeft, Clock3, Gauge, ListChecks } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { LevelAssessmentPlayer } from "@/components/tests/level-assessment-player";
import { getPublicGermanLevelAssessment } from "@/infrastructure/catalog/level-assessment";
import { isGermanLevel } from "@/infrastructure/catalog/lesson-content";

export const dynamic = "force-dynamic";

export default async function LevelTestPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const normalizedLevel = level.toUpperCase();
  if (!isGermanLevel(normalizedLevel)) notFound();
  const [user, assessment] = await Promise.all([getChatGPTUser(), Promise.resolve(getPublicGermanLevelAssessment(normalizedLevel))]);
  const productionIncluded = assessment.questions.some((question) => question.responseMode !== "choice");
  return <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card/90 px-5 py-4 sm:px-8"><div className="mx-auto flex max-w-[980px] items-center justify-between"><Link href="/tests" className="flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="size-4" />All level tests</Link><span className="font-display font-bold">German {normalizedLevel}</span></div></header>
    <div className="mx-auto max-w-[980px] px-5 py-10 sm:px-8 lg:py-14">
      <p className="text-sm font-bold text-progress">Level checkpoint · German {normalizedLevel}</p>
      <h1 className="font-display mt-2 text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.055em]">Show what you can use.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Answer every question. Listening can be replayed, and {productionIncluded ? "writing and speaking require you to produce German yourself" : "your result includes separate feedback for every available skill"}.</p>
      <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold text-muted-foreground"><span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-2"><ListChecks className="size-4 text-progress" />{assessment.questions.length} questions</span><span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-2"><Clock3 className="size-4 text-progress" />About {productionIncluded ? 20 : 12} minutes</span><span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-2"><Gauge className="size-4 text-progress" />{assessment.passThreshold}% overall · 70% per skill</span></div>
      <LevelAssessmentPlayer assessment={assessment} signedIn={Boolean(user)} />
    </div>
  </main>;
}
