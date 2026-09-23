import { ArrowLeft, BookOpen, Search } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { listAllPublicLessons, listVocabulary } from "@/infrastructure/catalog/lesson-content";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLocaleLowerCase();
  const lessonResults = query ? listAllPublicLessons().flatMap((lesson) => {
    const href = `/learn/de/${lesson.levelCode.toLowerCase()}/${lesson.slug}`;
    return [
      { id: lesson.id, type: `German ${lesson.levelCode} lesson`, title: lesson.title, detail: lesson.summary, href },
      ...lesson.vocabulary.map((item) => ({ id: item.id, type: `German ${lesson.levelCode} vocabulary`, title: item.lemma, detail: item.translation, href })),
      ...lesson.sentences.map((item) => ({ id: item.id, type: `German ${lesson.levelCode} phrase`, title: item.text, detail: item.translation, href })),
      { id: lesson.grammar.id, type: `German ${lesson.levelCode} grammar`, title: lesson.grammar.title, detail: lesson.grammar.explanation, href },
    ];
  }).filter((item) => `${item.title} ${item.detail} ${item.type}`.toLocaleLowerCase().includes(query)) : [];
  const coreResults = query ? listVocabulary("A1")
    .filter(({ vocabulary }) => vocabulary.languageFeatures.coreVocabulary === true)
    .filter(({ vocabulary, lesson }) => `${vocabulary.lemma} ${vocabulary.translation} ${lesson.title}`.toLocaleLowerCase().includes(query))
    .map(({ vocabulary }) => ({ id: vocabulary.id, type: "German A1 core vocabulary", title: vocabulary.lemma, detail: vocabulary.translation, href: `/vocabulary?q=${encodeURIComponent(vocabulary.lemma)}` })) : [];
  const results = [...lessonResults, ...coreResults].slice(0, 40);

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 px-5 py-4 backdrop-blur sm:px-8"><div className="mx-auto flex max-w-[900px] items-center justify-between"><Link href="/" className="flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="size-4" aria-hidden="true" />Dashboard</Link><span className="font-display font-bold">Language Guide</span></div></header>
      <div className="mx-auto max-w-[900px] px-5 py-10 sm:px-8 lg:py-16">
        <p className="text-sm font-bold text-progress">Search</p><h1 className="font-display mt-2 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Find the right word.</h1>
        <form className="relative mt-7"><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input name="q" defaultValue={q} autoFocus placeholder="Search vocabulary, lessons, and translations" className="h-14 rounded-2xl bg-card pl-12 text-base" /><button className="sr-only" type="submit">Search</button></form>
        <div className="mt-8" aria-live="polite">
          {!query ? <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">Try “hallo”, “Wohnung”, “obwohl”, or “opinion”.</p> : results.length ? <div className="grid gap-3">{results.map((item) => <Link href={item.href} key={item.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/35"><span className="grid size-11 place-items-center rounded-xl bg-muted"><BookOpen className="size-4" aria-hidden="true" /></span><span><span className="text-xs font-bold uppercase tracking-[0.1em] text-progress">{item.type}</span><span className="font-display mt-1 block text-xl font-bold">{item.title}</span><span className="mt-1 block text-sm text-muted-foreground">{item.detail}</span></span></Link>)}</div> : <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">No results yet. Try a shorter word or translation.</p>}
        </div>
      </div>
    </main>
  );
}
