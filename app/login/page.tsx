import { redirect } from "next/navigation";

import { getChatGPTUser, sanitizeReturnTo } from "@/app/chatgpt-auth";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const { return_to: requestedReturnTo } = await searchParams;
  const returnTo = sanitizeReturnTo(requestedReturnTo ?? "/");
  if (await getChatGPTUser()) redirect(returnTo);
  return <AuthShell eyebrow="Welcome back" title="Continue learning." description="Sign in to restore your German course, saved vocabulary, review queue, and progress."><AuthForm mode="login" returnTo={returnTo} /></AuthShell>;
}
