"use client";

import { BookmarkCheck, Headphones, LoaderCircle, Search, Trash2, Volume2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGermanSpeech } from "@/hooks/use-german-speech";
import type { SavedVocabularyView } from "@/infrastructure/learning/personal-library";

export function SavedVocabularyList({ initialItems }: { initialItems: SavedVocabularyView[] }) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const speech = useGermanSpeech();
  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return normalized ? items.filter((item) => `${item.vocabulary.lemma} ${item.vocabulary.translation} ${item.lesson.title}`.toLocaleLowerCase().includes(normalized)) : items;
  }, [items, query]);

  async function removeItem(item: SavedVocabularyView) {
    setRemoving(item.contentItemId);
    setMessage(null);
    try {
      const response = await fetch(`/api/v1/me/saved-items/${encodeURIComponent(item.contentItemId)}`, { method: "DELETE" });
      const body = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message ?? "The word could not be removed.");
      setItems((current) => current.filter((candidate) => candidate.contentItemId !== item.contentItemId));
      setMessage(`${item.vocabulary.lemma} was removed from your library.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The word could not be removed.");
    } finally {
      setRemoving(null);
    }
  }

  if (!items.length) {
    return <div className="mt-10 rounded-[28px] border border-border bg-card px-6 py-14 text-center shadow-[0_12px_38px_rgba(22,44,52,0.055)]"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent text-progress"><BookmarkCheck className="size-6" /></span><h2 className="font-display mt-5 text-2xl font-bold">Your first word is one lesson away.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Open a lesson and use the bookmark beside any word you want to remember.</p><Button asChild className="mt-6"><Link href="/learn">Browse lessons</Link></Button></div>;
  }

  return <>
    <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><label className="relative block sm:max-w-sm sm:flex-1"><span className="sr-only">Search saved vocabulary</span><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your saved words" className="h-12 rounded-xl bg-card pl-10" /></label><p className="text-sm font-semibold text-muted-foreground">{items.length} saved {items.length === 1 ? "word" : "words"}</p></div>
    <p aria-live="polite" className="mt-3 min-h-5 text-sm font-semibold text-muted-foreground">{speech.message ?? message}</p>
    <div className="mt-2 grid gap-3">{filteredItems.map((item) => { const active = speech.activeText === item.vocabulary.lemma; return <article key={item.contentItemId} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(22,44,52,0.04)] sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-2xl font-bold">{item.vocabulary.lemma}</h2><span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-progress">{reviewLabel(item.review?.state)}</span><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{item.lesson.levelCode}</span></div><p className="mt-1 text-sm text-muted-foreground">{item.vocabulary.translation}{item.vocabulary.pronunciation !== "audio" ? ` · /${item.vocabulary.pronunciation}/` : " · audio available"}</p><Link href={`/learn/de/${item.lesson.levelCode.toLowerCase()}/${item.lesson.slug}`} className="mt-3 inline-block text-xs font-bold text-primary hover:underline">From {item.lesson.title}</Link></div><div className="flex gap-2"><Button variant={active ? "default" : "outline"} size="icon" disabled={active && speech.isBusy} onClick={() => speech.speak(item.vocabulary.lemma)} aria-label={active && speech.isBusy ? `Playing ${item.vocabulary.lemma} in German` : `Hear ${item.vocabulary.lemma} in German`}>{active && speech.status === "loading" ? <LoaderCircle className="animate-spin" /> : active && speech.status === "speaking" ? <Volume2 /> : <Headphones />}</Button><Button variant="ghost" size="icon" disabled={removing === item.contentItemId} onClick={() => removeItem(item)} aria-label={`Remove ${item.vocabulary.lemma} from library`}><Trash2 /></Button></div></article>; })}</div>
    {!filteredItems.length ? <p className="mt-10 text-center text-sm font-semibold text-muted-foreground">No saved words match “{query}”.</p> : null}
  </>;
}

function reviewLabel(state?: "new" | "learning" | "review" | "mastered") {
  if (state === "mastered") return "Mastered";
  if (state === "review") return "In review";
  if (state === "learning") return "Learning";
  return "New";
}
