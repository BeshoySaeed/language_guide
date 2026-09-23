"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    console.error("Language Guide route error", error);
  }, [error]);

  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
      <section className="max-w-md text-center" role="alert" aria-describedby="error-description"><p className="text-sm font-bold text-progress">Something interrupted your session</p><h1 ref={headingRef} tabIndex={-1} className="font-display mt-2 text-4xl font-bold tracking-[-0.05em]">Let’s get you back to learning.</h1><p id="error-description" className="mt-3 text-muted-foreground">Your saved progress is safe. Retry this screen to continue.</p><Button className="mt-6 h-11 rounded-xl" onClick={reset}><RotateCcw aria-hidden="true" />Try again</Button></section>
    </main>
  );
}
