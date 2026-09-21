import { ArrowLeft, Bookmark, Check, Headphones, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { bootstrapLessons } from "@/infrastructure/catalog/bootstrap-lessons";

export default function LessonFoundationPage() {
  const lesson = bootstrapLessons["at-the-bakery"];
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[1180px] items-center gap-4">
          <Link href="/" className="grid size-11 place-items-center rounded-xl border border-border" aria-label="Back to dashboard"><ArrowLeft className="size-4" aria-hidden="true" /></Link>
          <div className="min-w-0"><p className="truncate text-sm font-bold">{lesson.title}</p><p className="text-xs text-muted-foreground">German {lesson.level} · {lesson.estimatedMinutes} min</p></div>
          <div className="ml-auto hidden w-52 sm:block"><Progress value={18} aria-label="Lesson progress: 18 percent" /></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:py-12">
        <aside className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Lesson path</p>
          <ol className="mt-5 space-y-1">
            {lesson.sections.map((section, index) => (
              <li key={section.id} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${section.state === "current" ? "bg-accent text-foreground" : "text-muted-foreground"}`}>
                <span className={`grid size-7 place-items-center rounded-full text-xs ${section.state === "complete" ? "bg-progress text-white" : section.state === "current" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{section.state === "complete" ? <Check className="size-3.5" /> : section.state === "upcoming" ? <LockKeyhole className="size-3" /> : index + 1}</span>
                {section.label}
              </li>
            ))}
          </ol>
        </aside>
        <article className="min-w-0">
          <p className="text-sm font-bold text-progress">Vocabulary · 3 words</p>
          <h1 className="font-display mt-2 text-[clamp(2.3rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.055em]">Start with the essentials.</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Listen, say each word aloud, then save anything you want to revisit.</p>
          <div className="mt-8 grid gap-3">
            {lesson.vocabulary.map((item, index) => (
              <section key={item.id} className="grid gap-5 rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(22,44,52,0.045)] sm:grid-cols-[44px_1fr_auto] sm:items-center">
                <span className="grid size-11 place-items-center rounded-xl bg-muted text-sm font-black text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <div><h2 className="font-display text-2xl font-bold">{item.word}</h2><p className="mt-1 text-sm text-muted-foreground">{item.translation} · /{item.pronunciation}/</p></div>
                <div className="flex gap-2"><Button variant="outline" size="icon" aria-label={`Listen to ${item.word}`}><Headphones aria-hidden="true" /></Button><Button variant="outline" size="icon" aria-label={`Save ${item.word}`}><Bookmark aria-hidden="true" /></Button></div>
              </section>
            ))}
          </div>
          <div className="mt-8 flex justify-end"><Button size="lg" className="h-12 rounded-xl px-6 font-bold">Continue to sentences</Button></div>
        </article>
      </div>
    </main>
  );
}
