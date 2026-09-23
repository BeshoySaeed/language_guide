"use client";

import { Check, Download, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { PublicLesson } from "@/infrastructure/catalog/lesson-content";
import { getOfflineLesson, saveOfflineLesson } from "@/lib/offline-db";

export function OfflineDownloadButton({ lesson, signedIn }: { lesson: PublicLesson; signedIn: boolean }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void getOfflineLesson(lesson.slug, lesson.levelCode).then((record) => { if (record?.revision === lesson.revision) setState("saved"); }).catch(() => undefined);
  }, [lesson.levelCode, lesson.revision, lesson.slug]);

  async function download() {
    if (state === "saving") return;
    setState("saving");
    setMessage(null);
    try {
      await navigator.storage?.persist?.();
      await warmOfflineShell();
      await saveOfflineLesson(lesson, signedIn);
      setState("saved");
      setMessage("Lesson ready offline.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "The lesson could not be downloaded.");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={download} disabled={state === "saving"} className="rounded-xl bg-card/80" aria-label={`Download or refresh ${lesson.title} for offline use`}>
        {state === "saving" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : state === "saved" ? <Check aria-hidden="true" /> : <Download aria-hidden="true" />}
        <span className="hidden sm:inline">{state === "saved" ? "Available offline" : state === "saving" ? "Downloading…" : "Download"}</span>
      </Button>
      {message ? <span className={`sr-only ${state === "error" ? "text-destructive" : ""}`} aria-live="polite">{message}</span> : null}
    </div>
  );
}

async function warmOfflineShell(): Promise<void> {
  if (!("serviceWorker" in navigator)) throw new Error("Offline lessons are not supported in this browser.");
  const registration = await navigator.serviceWorker.ready;
  const urls = await collectShellResources(["/offline", "/offline/lesson"]);
  const worker = registration.active ?? registration.waiting ?? registration.installing;
  if (!worker) throw new Error("Offline support is still starting. Please try again.");
  await new Promise<void>((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = window.setTimeout(() => reject(new Error("Offline download timed out. Please try again.")), 12_000);
    channel.port1.onmessage = (event) => {
      window.clearTimeout(timeout);
      if (event.data?.ok) resolve(); else reject(new Error("The offline lesson shell could not be saved."));
    };
    worker.postMessage({ type: "CACHE_OFFLINE_URLS", urls }, [channel.port2]);
  });
}

async function collectShellResources(routes: string[]): Promise<string[]> {
  const resources = new Set(routes);
  for (const route of routes) {
    const response = await fetch(route, { credentials: "same-origin" });
    if (!response.ok) throw new Error("The offline lesson shell could not be prepared.");
    const document = new DOMParser().parseFromString(await response.text(), "text/html");
    for (const element of document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>("script[src], link[rel='stylesheet'][href], link[rel='modulepreload'][href], link[rel='preload'][href]")) {
      const value = element instanceof HTMLScriptElement ? element.src : element.href;
      const url = new URL(value, window.location.origin);
      if (url.origin === window.location.origin) resources.add(`${url.pathname}${url.search}`);
    }
  }
  return [...resources];
}
