import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background p-6 sm:p-10" aria-label="Loading Language Guide">
      <div className="mx-auto max-w-[1180px] space-y-8">
        <div className="space-y-3"><Skeleton className="h-4 w-32" /><Skeleton className="h-12 w-full max-w-xl" /><Skeleton className="h-5 w-full max-w-md" /></div>
        <div className="grid gap-5 lg:grid-cols-[1.7fr_0.85fr]"><Skeleton className="h-80 rounded-[28px]" /><Skeleton className="h-80 rounded-[28px]" /></div>
      </div>
    </main>
  );
}

