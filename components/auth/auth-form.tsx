"use client";

import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "register";
type FieldErrors = Partial<Record<"displayName" | "email" | "password" | "confirmPassword", string>>;

export function AuthForm({ mode, returnTo }: { mode: AuthMode; returnTo: string }) {
  const registering = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (registering && password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      setError(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const response = await fetch(registering ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(registering ? { displayName, email, password } : { email, password }),
      });
      const body = await response.json() as { error?: { message?: string; issues?: Record<string, string[]> } };
      if (!response.ok) {
        const issues = body.error?.issues ?? {};
        setFieldErrors({
          displayName: issues.displayName?.[0],
          email: issues.email?.[0],
          password: issues.password?.[0],
        });
        throw new Error(body.error?.message ?? "Authentication could not be completed.");
      }
      window.location.assign(returnTo);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Authentication could not be completed.");
      setSubmitting(false);
    }
  }

  const alternateHref = `${registering ? "/login" : "/register"}?return_to=${encodeURIComponent(returnTo)}`;

  return (
    <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
      {registering ? <AuthField label="Name" name="displayName" autoComplete="name" icon={UserRound} error={fieldErrors.displayName} placeholder="Your name" /> : null}
      <AuthField label="Email address" name="email" type="email" autoComplete="email" icon={Mail} error={fieldErrors.email} placeholder="you@example.com" />
      <div>
        <label htmlFor={`${mode}-password`} className="text-sm font-bold">Password</label>
        <div className="relative mt-2">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id={`${mode}-password`} name="password" type={showPassword ? "text" : "password"} autoComplete={registering ? "new-password" : "current-password"} required minLength={registering ? 10 : undefined} maxLength={128} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? `${mode}-password-error` : registering ? `${mode}-password-help` : undefined} className="h-12 rounded-xl bg-card pl-11 pr-12" />
          <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}</button>
        </div>
        {fieldErrors.password ? <p id={`${mode}-password-error`} className="mt-1.5 text-xs font-semibold text-destructive">{fieldErrors.password}</p> : registering ? <p id={`${mode}-password-help`} className="mt-1.5 text-xs text-muted-foreground">At least 10 characters with a letter and a number.</p> : null}
      </div>
      {registering ? <AuthField label="Confirm password" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" icon={LockKeyhole} error={fieldErrors.confirmPassword} /> : null}

      {error ? <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm font-semibold text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" disabled={submitting} className="h-12 w-full rounded-xl font-bold">
        {submitting ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
        {submitting ? (registering ? "Creating account…" : "Signing in…") : (registering ? "Create account" : "Sign in")}
        {!submitting ? <ArrowRight aria-hidden="true" /> : null}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {registering ? "Already have an account?" : "New to Language Guide?"}{" "}
        <Link href={alternateHref} className="font-bold text-primary hover:underline">{registering ? "Sign in" : "Create an account"}</Link>
      </p>
    </form>
  );
}

function AuthField({ label, name, type = "text", autoComplete, icon: Icon, error, placeholder }: { label: string; name: string; type?: string; autoComplete: string; icon: typeof UserRound; error?: string; placeholder?: string }) {
  const id = `auth-${name}`;
  return <div><label htmlFor={id} className="text-sm font-bold">{label}</label><div className="relative mt-2"><Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id={id} name={name} type={type} autoComplete={autoComplete} required aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} placeholder={placeholder} className="h-12 rounded-xl bg-card pl-11" /></div>{error ? <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-destructive">{error}</p> : null}</div>;
}
