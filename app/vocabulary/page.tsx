import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { A1VocabularyBrowser } from "@/components/vocabulary/a1-vocabulary-browser";
import { listVocabulary } from "@/infrastructure/catalog/lesson-content";
import { loadSavedVocabulary } from "@/infrastructure/learning/personal-library";

export const dynamic = "force-dynamic";

export default async function VocabularyPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [{ q = "" }, user] = await Promise.all([searchParams, getChatGPTUser()]);
  const savedIds = user ? await safelyLoadSavedIds(user.userId) : [];
  const items = listVocabulary("A1").map(({ vocabulary, lesson }) => ({
    id: vocabulary.id,
    lemma: vocabulary.lemma,
    translation: vocabulary.translation,
    partOfSpeech: vocabulary.partOfSpeech,
    pronunciation: vocabulary.pronunciation,
    topic: typeof vocabulary.languageFeatures.topic === "string" ? vocabulary.languageFeatures.topic : lesson.title,
    sourceLessonId: lesson.id,
    sourceLessonSlug: lesson.slug,
  }));

  return <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card/90 px-5 py-4 backdrop-blur sm:px-8"><div className="mx-auto flex max-w-[1100px] items-center justify-between"><Link href="/learn?level=A1" className="flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="size-4" />A1 course</Link><span className="font-display font-bold">Language Guide</span></div></header>
    <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8 lg:py-14">
      <p className="text-sm font-bold text-progress">German A1 core word bank</p>
      <h1 className="font-display mt-2 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.06em]">1,000 useful words and forms.</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">Search the full A1 bank, hear German pronunciation, save difficult cards, and let spaced review bring them back. Lessons keep a small essential set; this bank provides broader recognition and active vocabulary without overloading one session.</p>
      <A1VocabularyBrowser items={items} initialQuery={q} initialSavedIds={savedIds} signedIn={Boolean(user)} />
    </div>
  </main>;
}

async function safelyLoadSavedIds(userId: string) {
  try { return (await loadSavedVocabulary(userId)).map((item) => item.contentItemId); }
  catch (error) { console.error("Failed to load saved A1 vocabulary", error); return []; }
}
