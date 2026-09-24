"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const routeLabels: Record<string, string> = {
  learn: "learning path",
  practice: "practice",
  tests: "level tests",
  review: "review queue",
  library: "library",
  offline: "offline lessons",
  progress: "progress",
  vocabulary: "word bank",
  search: "search",
  login: "sign in",
  register: "registration",
};

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [navigation, setNavigation] = useState<{ destination: string; source: string } | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    revealTimer.current = null;
    safetyTimer.current = null;
  }, []);

  const stopLoading = useCallback(() => {
    clearTimers();
    setNavigation(null);
  }, [clearTimers]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target || target.hasAttribute("download") || (target.target && target.target !== "_self")) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const nextUrl = new URL(target.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      if (nextUrl.origin !== currentUrl.origin) return;
      if (`${nextUrl.pathname}${nextUrl.search}` === `${currentUrl.pathname}${currentUrl.search}`) return;

      const route = nextUrl.pathname.split("/").filter(Boolean)[0];
      const label = route ? routeLabels[route] ?? "next page" : "dashboard";

      clearTimers();
      revealTimer.current = setTimeout(() => setNavigation({ destination: label, source: routeKey }), 120);
      safetyTimer.current = setTimeout(stopLoading, 12_000);
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("pageshow", stopLoading);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("pageshow", stopLoading);
      clearTimers();
    };
  }, [clearTimers, routeKey, stopLoading]);

  if (!navigation || navigation.source !== routeKey) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[90]" role="status" aria-live="polite" aria-label={`Opening ${navigation.destination}`}>
      <div className="navigation-progress-track" aria-hidden="true">
        <span className="navigation-progress-bar" />
      </div>
      <div className="mx-auto mt-3 flex w-fit items-center gap-2.5 rounded-full border border-border bg-card/95 px-4 py-2 text-sm font-bold text-foreground shadow-[0_12px_36px_rgba(7,24,29,0.18)] backdrop-blur">
        <span className="navigation-loader-mark" aria-hidden="true">L</span>
        <span>Opening {navigation.destination}…</span>
      </div>
    </div>
  );
}
