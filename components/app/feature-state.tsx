import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  icon: LucideIcon;
};

export function FeatureState({ eyebrow, title, description, emptyTitle, emptyDescription, icon: Icon }: Props) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[980px] items-center justify-between"><Link href="/" className="flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="size-4" aria-hidden="true" />Dashboard</Link><span className="font-display font-bold">Language Guide</span></div>
      </header>
      <div className="mx-auto max-w-[980px] px-5 py-10 sm:px-8 lg:py-16">
        <p className="text-sm font-bold text-progress">{eyebrow}</p>
        <h1 className="font-display mt-2 text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.055em]">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>
        <Empty className="mt-10 min-h-80 border border-border bg-card shadow-[0_12px_38px_rgba(22,44,52,0.055)]">
          <EmptyHeader><EmptyMedia variant="icon"><Icon aria-hidden="true" /></EmptyMedia><EmptyTitle className="font-display text-2xl font-bold">{emptyTitle}</EmptyTitle><EmptyDescription>{emptyDescription}</EmptyDescription></EmptyHeader>
          <EmptyContent><Button asChild className="h-11 rounded-xl"><Link href="/learn">Choose a learning path<ArrowRight aria-hidden="true" /></Link></Button></EmptyContent>
        </Empty>
      </div>
    </main>
  );
}
