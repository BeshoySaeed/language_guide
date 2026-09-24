import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background p-6 sm:p-10" aria-busy="true" aria-label="Loading Language Guide">
      <p className="sr-only" role="status" aria-live="polite">Loading Language Guide…</p>
      <div className="mx-auto max-w-[1180px]">
        <div className="flex items-center justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <span className="navigation-loader-mark size-10 rounded-xl text-base" aria-hidden="true">L</span>
            <div><p className="font-display font-bold">Language Guide</p><p className="text-xs font-semibold text-muted-foreground">Preparing your German practice…</p></div>
          </div>
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
        <div className="mt-10 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-5 w-full max-w-md" />
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.7fr_0.85fr]"><Skeleton className="h-80 rounded-[28px]" /><Skeleton className="h-80 rounded-[28px]" /></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-32 rounded-2xl" />)}</div>
      </div>
    </main>
  );
}
