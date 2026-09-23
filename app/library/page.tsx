import { ArrowLeft, BookmarkCheck } from "lucide-react";
import Link from "next/link";

import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { SavedVocabularyList } from "@/components/library/saved-vocabulary-list";
import { Button } from "@/components/ui/button";
import { loadSavedVocabulary } from "@/infrastructure/learning/personal-library";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await getChatGPTUser();
  const items = user ? await safelyLoadSavedVocabulary(user.userId) : [];

  return <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card/90 px-5 py-4 backdrop-blur sm:px-8"><div className="mx-auto flex max-w-[980px] items-center justify-between"><Link href="/" className="flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="size-4" />Dashboard</Link><span className="font-display font-bold">Language Guide</span></div></header>
    <div className="mx-auto max-w-[980px] px-5 py-10 sm:px-8 lg:py-16">
      <div className="flex items-start gap-4"><span className="mt-1 hidden size-12 shrink-0 place-items-center rounded-2xl bg-accent text-progress sm:grid"><BookmarkCheck /></span><div><p className="text-sm font-bold text-progress">Personal library</p><h1 className="font-display mt-2 text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.055em]">Words worth keeping.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Save vocabulary as you learn, find it quickly, and let the review queue handle the timing.</p></div></div>
      {!user ? <div className="mt-10 rounded-[28px] border border-border bg-card p-8 text-center"><h2 className="font-display text-2xl font-bold">Your library travels with you.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Sign in to save words and review them across devices.</p><Button asChild className="mt-6"><a href={chatGPTSignInPath("/library")} target="_top">Sign in</a></Button></div> : <SavedVocabularyList initialItems={items} />}
    </div>
  </main>;
}

async function safelyLoadSavedVocabulary(userId: string) {
  try { return await loadSavedVocabulary(userId); }
  catch (error) { console.error("Failed to load library", error); return []; }
}
