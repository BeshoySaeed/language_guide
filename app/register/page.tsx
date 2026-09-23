import { redirect } from "next/navigation";

import { getChatGPTUser, sanitizeReturnTo } from "@/app/chatgpt-auth";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const { return_to: requestedReturnTo } = await searchParams;
  const returnTo = sanitizeReturnTo(requestedReturnTo ?? "/");
  if (await getChatGPTUser()) redirect(returnTo);
  return <AuthShell eyebrow="Create your account" title="Start with a clean slate." description="Your account keeps German lessons, review timing, and progress private and available across devices."><AuthForm mode="register" returnTo={returnTo} /></AuthShell>;
}
