import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { LevelVocabularyBrowser } from "@/components/vocabulary/a1-vocabulary-browser";
import { isGermanLevel, listVocabulary } from "@/infrastructure/catalog/lesson-content";
import { loadSavedVocabulary } from "@/infrastructure/learning/personal-library";

export const dynamic = "force-dynamic";

export default async function VocabularyPage({ searchParams }: { searchParams: Promise<{ q?: string; level?: string }> }) {
  const [{ q = "", level: requestedLevel }, user] = await Promise.all([searchParams, getChatGPTUser()]);
  const level = requestedLevel && isGermanLevel(requestedLevel) ? requestedLevel : "A1";
  const savedIds = user ? await safelyLoadSavedIds(user.userId) : [];
  const items = listVocabulary(level).map(({ vocabulary, lesson }) => ({
    id: vocabulary.id,
    lemma: vocabulary.lemma,
    translation: vocabulary.translation,
    partOfSpeech: vocabulary.partOfSpeech,
    pronunciation: vocabulary.pronunciation,
    exampleSentence: vocabulary.exampleSentence,
    exampleTranslation: vocabulary.exampleTranslation,
    topic: typeof vocabulary.languageFeatures.topic === "string" ? vocabulary.languageFeatures.topic : lesson.title,
    sourceLessonId: lesson.id,
    sourceLessonSlug: lesson.slug,
  }));

  return <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card/90 px-5 py-4 backdrop-blur sm:px-8"><div className="mx-auto flex max-w-[1100px] items-center justify-between"><Link href={`/learn?level=${level}`} className="flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="size-4" />{level} course</Link><span className="font-display font-bold">Language Guide</span></div></header>
    <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8 lg:py-14">
      <p className="text-sm font-bold text-progress">German {level} core word bank</p>
      <h1 className="font-display mt-2 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.06em]">{items.length.toLocaleString("en")} useful words, forms, and chunks.</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">Search the full {level} bank, hear German pronunciation, save difficult cards, and let spaced review bring them back. Lessons keep a focused essential set; this bank broadens recognition and active control without overloading one session.</p>
      <div className="mt-5 flex gap-2"><Link className={`rounded-full px-4 py-2 text-sm font-bold ${level === "A1" ? "bg-primary text-primary-foreground" : "bg-muted"}`} href="/vocabulary?level=A1">A1 bank</Link><Link className={`rounded-full px-4 py-2 text-sm font-bold ${level === "A2" ? "bg-primary text-primary-foreground" : "bg-muted"}`} href="/vocabulary?level=A2">A2 bank</Link><Link className={`rounded-full px-4 py-2 text-sm font-bold ${level === "B1" ? "bg-primary text-primary-foreground" : "bg-muted"}`} href="/vocabulary?level=B1">B1 bank</Link></div>
      <LevelVocabularyBrowser items={items} initialQuery={q} initialSavedIds={savedIds} signedIn={Boolean(user)} level={level} />
    </div>
  </main>;
}

async function safelyLoadSavedIds(userId: string) {
  try { return (await loadSavedVocabulary(userId)).map((item) => item.contentItemId); }
  catch (error) { console.error("Failed to load saved vocabulary", error); return []; }
}
