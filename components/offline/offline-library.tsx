"use client";

import { ArrowLeft, ArrowRight, BookOpen, Cloud, CloudOff, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useNetworkStatus } from "@/hooks/use-network-status";
import {
  listOfflineLessons,
  listOfflineMutations,
  removeOfflineLesson,
  type OfflineLessonRecord,
} from "@/lib/offline-db";
import { flushOfflineQueue } from "@/lib/offline-sync";

export function OfflineLibrary() {
  const [lessons, setLessons] = useState<OfflineLessonRecord[]>([]);
  const [pending, setPending] = useState(0);
  const online = useNetworkStatus();
  const [syncing, setSyncing] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const [savedLessons, operations] = await Promise.all([listOfflineLessons(), listOfflineMutations()]);
    setLessons(savedLessons);
    setPending(operations.length);
    setReady(true);
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => { void refresh().catch(() => setReady(true)); }, 0);
    const handleOnline = () => { void refresh(); };
    window.addEventListener("online", handleOnline);
    window.addEventListener("language-guide-offline-change", refresh);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("language-guide-offline-change", refresh);
      window.clearTimeout(initialRefresh);
    };
  }, [refresh]);

  async function sync() {
    setSyncing(true);
    await flushOfflineQueue().catch(() => 0);
    await refresh();
    setSyncing(false);
  }

  async function remove(id: string) {
    await removeOfflineLesson(id);
    await refresh();
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4">
          <Link href="/learn" className="flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="size-4" aria-hidden="true" />Learning path</Link>
          <span className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${online ? "bg-accent text-progress" : "bg-ink text-white"}`}>
            {online ? <Cloud className="size-3.5" aria-hidden="true" /> : <CloudOff className="size-3.5" aria-hidden="true" />}
            {online ? "Online" : "Offline"}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-5 py-9 sm:px-8 lg:py-12">
        <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-end">
          <div>
            <p className="text-sm font-bold text-progress">Offline learning</p>
            <h1 className="font-display mt-2 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.06em]">Your lessons, wherever you are.</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Downloaded lesson content stays on this device. Progress and library changes wait safely and sync when your connection returns.</p>
          </div>
          <aside className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-bold">Sync queue</p>
            <p className="font-display mt-2 text-3xl font-bold">{pending}</p>
            <p className="mt-1 text-sm text-muted-foreground">{pending === 1 ? "change waiting" : "changes waiting"}</p>
            <Button className="mt-4 w-full" variant="outline" disabled={!online || syncing || pending === 0} onClick={sync}>
              <RefreshCw className={syncing ? "animate-spin" : ""} aria-hidden="true" />{syncing ? "Syncing…" : "Sync now"}
            </Button>
          </aside>
        </section>

        <section className="mt-10" aria-labelledby="downloaded-lessons-heading">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-sm font-bold text-progress">On this device</p><h2 id="downloaded-lessons-heading" className="font-display text-2xl font-bold">Downloaded lessons</h2></div>
            <span className="text-sm font-semibold text-muted-foreground">{lessons.length} saved</span>
          </div>

          {!ready ? <div role="status" aria-label="Loading downloaded lessons" className="mt-5 h-32 animate-pulse rounded-2xl bg-muted" /> : lessons.length ? (
            <ul className="mt-5 grid gap-4">
              {lessons.map((record) => (
                <li key={record.id} className="grid gap-5 rounded-[24px] border border-border bg-card p-5 shadow-[0_10px_30px_rgba(22,44,52,0.045)] sm:grid-cols-[52px_minmax(0,1fr)_auto] sm:items-center">
                  <span className="grid size-12 place-items-center rounded-2xl bg-accent text-progress"><BookOpen className="size-5" aria-hidden="true" /></span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-xl font-bold">{record.title}</h3><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">German {record.levelCode}</span></div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{record.summary}</p>
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">{record.estimatedMinutes} min · saved {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(record.downloadedAt))}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild><Link href={`/offline/lesson?level=${record.levelCode}&slug=${encodeURIComponent(record.slug)}`}>Open<ArrowRight aria-hidden="true" /></Link></Button>
                    <Button variant="outline" size="icon" onClick={() => remove(record.id)} aria-label={`Remove ${record.title} from this device`}><Trash2 aria-hidden="true" /></Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-[26px] border border-dashed border-border bg-card p-8 text-center sm:p-12">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-muted"><CloudOff className="size-6 text-muted-foreground" aria-hidden="true" /></span>
              <h3 className="font-display mt-5 text-2xl font-bold">No lessons downloaded yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Open a lesson while online and choose Download. Its vocabulary, phrases, grammar, reading, and assessment questions will be stored here.</p>
              <Button asChild className="mt-5"><Link href="/learn">Choose a lesson<ArrowRight aria-hidden="true" /></Link></Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
