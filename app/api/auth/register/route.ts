import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { authCredentials, authSessions, enrollments, languageLevels, languages, levels, userPreferences, users } from "@/db/schema";
import { apiError, validationError } from "@/lib/api-response";
import { hashPassword } from "@/lib/auth/password";
import { isSameOriginRequest } from "@/lib/auth/request";
import { createSession, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/auth/session";
import { registerInputSchema } from "@/packages/contracts/src/auth";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("INVALID_ORIGIN", "The request origin is not allowed.", 403);
  const parsed = registerInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const db = getDb();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (existing) return apiError("EMAIL_UNAVAILABLE", "An account already uses that email address.", 409);

  const [password, session] = await Promise.all([hashPassword(parsed.data.password), createSession()]);
  const now = new Date().toISOString();
  const userId = `user:${crypto.randomUUID()}`;

  try {
    await db.batch([
      db.insert(users).values({ id: userId, email: parsed.data.email, displayName: parsed.data.displayName, updatedAt: now }),
      db.insert(authCredentials).values({ userId, passwordHash: password.hash, passwordSalt: password.salt, passwordIterations: password.iterations, passwordChangedAt: now, updatedAt: now }),
      db.insert(userPreferences).values({ userId, updatedAt: now }),
      db.insert(languages).values({ code: "de", name: "German", nativeName: "Deutsch", direction: "ltr", updatedAt: now }).onConflictDoNothing(),
      db.insert(levels).values({ code: "A1", rank: 1 }).onConflictDoNothing(),
      db.insert(languageLevels).values({ languageCode: "de", levelCode: "A1" }).onConflictDoNothing(),
      db.insert(enrollments).values({ id: `${userId}:de`, userId, languageCode: "de", currentLevelCode: "A1", updatedAt: now }),
      db.insert(authSessions).values({ id: session.id, userId, expiresAt: session.expiresAt, lastSeenAt: now, updatedAt: now }),
    ]);
  } catch (error) {
    console.error("Failed to register account", error);
    return apiError("REGISTRATION_FAILED", "Your account could not be created. Please try again.", 503);
  }

  const response = NextResponse.json({ data: { id: userId, email: parsed.data.email, displayName: parsed.data.displayName } }, { status: 201 });
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
