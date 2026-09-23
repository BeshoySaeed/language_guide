import { BookOpenText, Check, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function AuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 lg:grid lg:place-items-center">
      <div className="mx-auto grid w-full max-w-[1060px] overflow-hidden rounded-[32px] border border-border bg-card shadow-[0_30px_90px_rgba(13,33,39,0.14)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative overflow-hidden bg-ink p-7 text-white sm:p-10 lg:p-12">
          <div className="absolute -right-20 -top-24 size-72 rounded-full border-[48px] border-white/[0.055]" aria-hidden="true" />
          <Link href="/" className="relative inline-flex items-center gap-3 font-display text-lg font-bold"><span className="grid size-10 place-items-center rounded-xl bg-white text-ink">L</span>Language Guide</Link>
          <div className="relative mt-16 lg:mt-28">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/10"><BookOpenText className="size-5 text-[#8fd8bf]" aria-hidden="true" /></span>
            <h2 className="font-display mt-6 text-3xl font-bold leading-tight tracking-[-0.045em]">Your German progress belongs to you.</h2>
            <ul className="mt-7 space-y-4 text-sm text-white/75">
              <li className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-[#8fd8bf]" aria-hidden="true" />Continue A1, A2, or B1 on any device</li>
              <li className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-[#8fd8bf]" aria-hidden="true" />Keep saved vocabulary and review timing together</li>
              <li className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#8fd8bf]" aria-hidden="true" />Passwords are salted and securely derived</li>
            </ul>
          </div>
        </aside>
        <section className="p-7 sm:p-10 lg:p-12">
          <p className="text-sm font-bold text-progress">{eyebrow}</p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-md leading-7 text-muted-foreground">{description}</p>
          {children}
        </section>
      </div>
    </main>
  );
}
