"use client";

import { Bookmark, Headphones, LoaderCircle, Search, Volume2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGermanSpeech } from "@/hooks/use-german-speech";

type Item = Readonly<{ id: string; lemma: string; translation: string; partOfSpeech: string; pronunciation: string; topic: string; sourceLessonId: string; sourceLessonSlug: string }>;

export function A1VocabularyBrowser({ items, initialQuery, initialSavedIds, signedIn }: { items: readonly Item[]; initialQuery: string; initialSavedIds: readonly string[]; signedIn: boolean }) {
  const [query, setQuery] = useState(initialQuery);
  const [part, setPart] = useState("all");
  const [visible, setVisible] = useState(40);
  const [saved, setSaved] = useState(() => new Set(initialSavedIds));
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const speech = useGermanSpeech();
  const parts = useMemo(() => ["all", ...new Set(items.map((item) => broadPart(item.partOfSpeech)))], [items]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("de-DE");
    return items.filter((item) => (part === "all" || broadPart(item.partOfSpeech) === part) && (!normalized || `${item.lemma} ${item.translation} ${item.topic}`.toLocaleLowerCase("de-DE").includes(normalized)));
  }, [items, part, query]);

  async function toggle(item: Item) {
    if (!signedIn || saving) return;
    setSaving(item.id);
    setMessage(null);
    try {
      const isSaved = saved.has(item.id);
      const response = await fetch(isSaved ? `/api/v1/me/saved-items/${encodeURIComponent(item.id)}` : "/api/v1/me/saved-items", {
        method: isSaved ? "DELETE" : "POST",
        headers: isSaved ? undefined : { "content-type": "application/json" },
        body: isSaved ? undefined : JSON.stringify({ contentItemId: item.id, sourceLessonId: item.sourceLessonId, difficult: false }),
      });
      const body = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message ?? "The word could not be saved.");
      setSaved((current) => { const next = new Set(current); if (isSaved) next.delete(item.id); else next.add(item.id); return next; });
      setMessage(`${item.lemma} ${isSaved ? "was removed from" : "was added to"} your review library.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The word could not be saved.");
    } finally { setSaving(null); }
  }

  return <section className="mt-9">
    <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_220px]">
      <label className="relative"><span className="sr-only">Search A1 vocabulary</span><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => { setQuery(event.target.value); setVisible(40); }} placeholder="Search German, English, or topic" className="h-12 pl-10" /></label>
      <label><span className="sr-only">Filter by word type</span><select value={part} onChange={(event) => { setPart(event.target.value); setVisible(40); }} className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm font-semibold">{parts.map((value) => <option key={value} value={value}>{value === "all" ? "All word types" : value}</option>)}</select></label>
    </div>
    <div className="mt-4 flex items-center justify-between text-sm font-semibold text-muted-foreground"><p>{filtered.length} matching cards</p><p>{saved.size} saved</p></div>
    <p aria-live="polite" className="mt-2 min-h-5 text-sm font-semibold text-muted-foreground">{speech.message ?? message}</p>
    <div className="mt-2 grid gap-3 md:grid-cols-2">{filtered.slice(0, visible).map((item) => { const active = speech.activeText === item.lemma; const isSaved = saved.has(item.id); return <article key={item.id} className="rounded-2xl border border-border bg-card p-5"><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wide text-progress">{broadPart(item.partOfSpeech)} · {item.topic}</p><h2 className="font-display mt-1 text-2xl font-bold">{item.lemma}</h2><p className="mt-1 text-sm text-muted-foreground">{item.translation}{item.pronunciation !== "audio" ? ` · /${item.pronunciation}/` : ""}</p></div><Button variant={active ? "default" : "outline"} size="icon" disabled={active && speech.isBusy} onClick={() => speech.speak(item.lemma)} aria-label={`Hear ${item.lemma} in German`}>{active && speech.status === "loading" ? <LoaderCircle className="animate-spin" /> : active && speech.status === "speaking" ? <Volume2 /> : <Headphones />}</Button>{signedIn ? <Button variant={isSaved ? "default" : "outline"} size="icon" disabled={saving === item.id} aria-pressed={isSaved} onClick={() => void toggle(item)} aria-label={isSaved ? `Remove ${item.lemma} from review` : `Save ${item.lemma} for review`}><Bookmark className={isSaved ? "fill-current" : ""} /></Button> : <Button asChild variant="outline" size="icon"><a href={chatGPTSignInPath("/vocabulary")} target="_top" aria-label={`Sign in to save ${item.lemma}`}><Bookmark /></a></Button>}</div><Link href={`/learn/de/a1/${item.sourceLessonSlug}`} className="mt-3 inline-block text-xs font-bold text-primary hover:underline">Related lesson</Link></article>; })}</div>
    {!filtered.length ? <p className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">No A1 cards match that search.</p> : null}
    {visible < filtered.length ? <div className="mt-7 text-center"><Button variant="outline" size="lg" onClick={() => setVisible((count) => count + 40)}>Show 40 more</Button></div> : null}
  </section>;
}

function broadPart(part: string) {
  if (part.includes("verb") || part.includes("tense")) return "Verbs";
  if (part.includes("noun")) return "Nouns";
  if (part.includes("adjective")) return "Adjectives";
  if (part.includes("number") || part.includes("date")) return "Numbers & dates";
  if (part.includes("phrase") || part.includes("adverb")) return "Phrases & connectors";
  return "Other forms";
}

function chatGPTSignInPath(_returnTo: string) {
  return `/login?return_to=${encodeURIComponent(_returnTo)}`;
}
