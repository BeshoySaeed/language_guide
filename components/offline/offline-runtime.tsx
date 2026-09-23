"use client";

import { CloudOff, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { listOfflineMutations } from "@/lib/offline-db";
import { flushOfflineQueue } from "@/lib/offline-sync";
import { useNetworkStatus } from "@/hooks/use-network-status";

export function OfflineRuntime() {
  const online = useNetworkStatus();
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshPending = useCallback(async () => {
    const operations = await listOfflineMutations().catch(() => []);
    setPending(operations.length);
  }, []);

  const sync = useCallback(async () => {
    if (!navigator.onLine) return;
    setSyncing(true);
    await flushOfflineQueue().catch(() => 0);
    await refreshPending();
    setSyncing(false);
  }, [refreshPending]);

  useEffect(() => {
    void navigator.serviceWorker?.register("/sw.js").catch(() => undefined);
    const initialRefresh = window.setTimeout(() => {
      if (navigator.onLine) void sync(); else void refreshPending();
    }, 0);
    const handleOnline = () => { void sync(); };
    window.addEventListener("online", handleOnline);
    window.addEventListener("language-guide-offline-change", refreshPending);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("language-guide-offline-change", refreshPending);
      window.clearTimeout(initialRefresh);
    };
  }, [refreshPending, sync]);

  if (online && !pending) return null;

  return (
    <div className={`fixed inset-x-0 top-0 z-[80] flex min-h-10 items-center justify-center gap-3 px-4 py-2 text-sm font-semibold shadow-sm ${online ? "bg-accent text-accent-foreground" : "bg-ink text-white"}`} role="status">
      {online ? <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} aria-hidden="true" /> : <CloudOff className="size-4" aria-hidden="true" />}
      <span>{online ? `${pending} offline ${pending === 1 ? "change" : "changes"} waiting to sync` : "You’re offline. Downloaded lessons are still available."}</span>
      <Link href="/offline" className="underline underline-offset-4">Open offline library</Link>
    </div>
  );
}
