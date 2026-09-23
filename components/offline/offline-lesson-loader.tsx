"use client";

import { ArrowLeft, CloudOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { LessonPlayer } from "@/components/learn/lesson-player";
import { Button } from "@/components/ui/button";
import { getOfflineLesson, type OfflineLessonRecord } from "@/lib/offline-db";
import { isGermanLevel } from "@/infrastructure/catalog/lesson-content";

export function OfflineLessonLoader() {
  const [record, setRecord] = useState<OfflineLessonRecord | null | undefined>(undefined);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("slug");
    const levelCode = new URLSearchParams(window.location.search).get("level");
    void getOfflineLesson(slug ?? "", levelCode && isGermanLevel(levelCode) ? levelCode : undefined).then((savedLesson) => setRecord(slug ? savedLesson : null)).catch(() => setRecord(null));
  }, []);

  if (record === undefined) return <main id="main-content" tabIndex={-1} aria-busy="true" className="grid min-h-screen place-items-center bg-background"><div role="status" className="flex items-center gap-3 text-sm font-bold text-muted-foreground"><LoaderCircle className="size-5 animate-spin" aria-hidden="true" />Opening downloaded lesson…</div></main>;
  if (!record) return (
    <main id="main-content" tabIndex={-1} className="grid min-h-screen place-items-center bg-background px-5 text-center text-foreground">
      <div><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-muted"><CloudOff className="size-7" aria-hidden="true" /></span><h1 className="font-display mt-5 text-3xl font-bold">Lesson not found on this device</h1><p className="mt-2 text-muted-foreground">Return to your offline library and choose a downloaded lesson.</p><Button asChild className="mt-6"><Link href="/offline"><ArrowLeft aria-hidden="true" />Offline library</Link></Button></div>
    </main>
  );

  return <LessonPlayer lesson={record.lesson} signedIn={record.signedInWhenDownloaded} signInPath="/" offlineSnapshot />;
}
