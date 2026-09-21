import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { LanguageSelector } from "@/components/learn/language-selector";
import { getLanguageCatalog } from "@/packages/application/src/get-language-catalog";
import { languageRepository } from "@/infrastructure/catalog/configured-language-repository";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const [user, languages] = await Promise.all([getChatGPTUser(), getLanguageCatalog(languageRepository)]);
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between">
          <Link href="/" className="flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="size-4" aria-hidden="true" />Dashboard</Link>
          <span className="font-display font-bold">Language Guide</span>
        </div>
      </header>
      <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:py-16">
        <LanguageSelector languages={languages} signedIn={Boolean(user)} signInPath={chatGPTSignInPath("/learn")} />
      </div>
    </main>
  );
}
