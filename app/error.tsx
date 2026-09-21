"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
      <section className="max-w-md text-center"><p className="text-sm font-bold text-progress">Something interrupted your session</p><h1 className="font-display mt-2 text-4xl font-bold tracking-[-0.05em]">Let’s get you back to learning.</h1><p className="mt-3 text-muted-foreground">Your saved progress is safe. Retry this screen to continue.</p><Button className="mt-6 h-11 rounded-xl" onClick={reset}><RotateCcw aria-hidden="true" />Try again</Button></section>
    </main>
  );
}

