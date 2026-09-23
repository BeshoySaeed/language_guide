import { and, eq, lt } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { authCredentials, authSessions, users } from "@/db/schema";
import { apiError, validationError } from "@/lib/api-response";
import { consumeDummyPasswordCheck, verifyPassword } from "@/lib/auth/password";
import { isSameOriginRequest } from "@/lib/auth/request";
import { createSession, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/auth/session";
import { loginInputSchema } from "@/packages/contracts/src/auth";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("INVALID_ORIGIN", "The request origin is not allowed.", 403);
  const parsed = loginInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const db = getDb();
  const [account] = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      status: users.status,
      passwordHash: authCredentials.passwordHash,
      passwordSalt: authCredentials.passwordSalt,
      passwordIterations: authCredentials.passwordIterations,
      failedLoginAttempts: authCredentials.failedLoginAttempts,
      lockedUntil: authCredentials.lockedUntil,
    })
    .from(users)
    .innerJoin(authCredentials, eq(authCredentials.userId, users.id))
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (!account) {
    await consumeDummyPasswordCheck(parsed.data.password);
    return invalidCredentials();
  }

  const now = new Date();
  if (account.lockedUntil && new Date(account.lockedUntil) > now) {
    return apiError("LOGIN_TEMPORARILY_LOCKED", "Too many attempts. Try again in 15 minutes.", 429);
  }

  const valid = account.status === "active" && await verifyPassword(parsed.data.password, {
    hash: account.passwordHash,
    salt: account.passwordSalt,
    iterations: account.passwordIterations,
  });

  if (!valid) {
    const failedLoginAttempts = account.failedLoginAttempts + 1;
    const lockedUntil = failedLoginAttempts >= MAX_FAILED_ATTEMPTS
      ? new Date(now.getTime() + LOCK_MINUTES * 60_000).toISOString()
      : null;
    await db.update(authCredentials).set({ failedLoginAttempts, lockedUntil, updatedAt: now.toISOString() }).where(eq(authCredentials.userId, account.id));
    return lockedUntil
      ? apiError("LOGIN_TEMPORARILY_LOCKED", "Too many attempts. Try again in 15 minutes.", 429)
      : invalidCredentials();
  }

  const session = await createSession();
  const nowIso = now.toISOString();
  await db.batch([
    db.update(authCredentials).set({ failedLoginAttempts: 0, lockedUntil: null, updatedAt: nowIso }).where(eq(authCredentials.userId, account.id)),
    db.delete(authSessions).where(and(eq(authSessions.userId, account.id), lt(authSessions.expiresAt, nowIso))),
    db.insert(authSessions).values({ id: session.id, userId: account.id, expiresAt: session.expiresAt, lastSeenAt: nowIso, updatedAt: nowIso }),
  ]);

  const response = NextResponse.json({ data: { id: account.id, email: account.email, displayName: account.displayName ?? account.email } });
  response.cookies.set(SESSION_COOKIE_NAME, session.token, {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
    expires: new Date(session.expiresAt),
  });
  return response;
}

function invalidCredentials() {
  return apiError("INVALID_CREDENTIALS", "The email or password is incorrect.", 401);
}
