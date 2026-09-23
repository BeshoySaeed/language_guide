import { ArrowLeft, Target } from "lucide-react";
import Link from "next/link";

import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { ReviewSession } from "@/components/review/review-session";
import { Button } from "@/components/ui/button";
import { loadDueReviews } from "@/infrastructure/learning/personal-library";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const user = await getChatGPTUser();
  const items = user ? await safelyLoadDueReviews(user.userId) : [];

  return <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card/90 px-5 py-4 backdrop-blur sm:px-8"><div className="mx-auto flex max-w-[860px] items-center justify-between"><Link href="/" className="flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="size-4" />Dashboard</Link><span className="font-display font-bold">Language Guide</span></div></header>
    <div className="mx-auto max-w-[860px] px-5 py-10 sm:px-8 lg:py-16">
      <div className="flex items-start gap-4"><span className="mt-1 hidden size-12 shrink-0 place-items-center rounded-2xl bg-accent text-progress sm:grid"><Target /></span><div><p className="text-sm font-bold text-progress">Spaced review</p><h1 className="font-display mt-2 text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.055em]">Remember what matters.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Recall the meaning first, then rate the effort honestly. Your next review adapts to each answer.</p></div></div>
      {!user ? <div className="mt-10 rounded-[28px] border border-border bg-card p-8 text-center"><h2 className="font-display text-2xl font-bold">Build a review rhythm.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Sign in to keep a private review queue that follows your learning.</p><Button asChild className="mt-6"><a href={chatGPTSignInPath("/review")} target="_top">Sign in</a></Button></div> : <ReviewSession initialItems={items} />}
    </div>
  </main>;
}

async function safelyLoadDueReviews(userId: string) {
  try { return await loadDueReviews(userId); }
  catch (error) { console.error("Failed to load review queue", error); return []; }
}
