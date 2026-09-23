import { LogIn, LogOut, UserRound } from "lucide-react";
import Link from "next/link";

import { chatGPTSignInPath, chatGPTSignOutPath, type ChatGPTUser } from "@/app/chatgpt-auth";
import { Button } from "@/components/ui/button";

export function AccountMenu({ user }: { user: ChatGPTUser | null }) {
  if (!user) return <Button asChild variant="outline" className="h-11 rounded-xl"><Link href={chatGPTSignInPath("/")}><LogIn aria-hidden="true" />Sign in</Link></Button>;
  const initial = user.displayName.slice(0, 1).toUpperCase();
  return (
    <details className="group relative">
      <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full bg-ink text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label="Open account menu">{initial}</summary>
      <div className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-border bg-card p-3 shadow-[0_18px_55px_rgba(13,33,39,0.18)]">
        <div className="flex items-center gap-3 rounded-xl bg-muted/70 p-3"><span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground"><UserRound className="size-4" aria-hidden="true" /></span><div className="min-w-0"><p className="truncate text-sm font-bold">{user.displayName}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div></div>
        <form action={chatGPTSignOutPath("/")} method="post" className="mt-2"><button type="submit" aria-label="Sign out of Language Guide" className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"><LogOut className="size-4" aria-hidden="true" />Sign out</button></form>
      </div>
    </details>
  );
}
