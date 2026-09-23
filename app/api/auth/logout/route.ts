import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { sanitizeReturnTo } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { authSessions } from "@/db/schema";
import { isSameOriginRequest } from "@/lib/auth/request";
import { hashSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: { code: "INVALID_ORIGIN", message: "The request origin is not allowed." } }, { status: 403 });
  const url = new URL(request.url);
  const returnTo = sanitizeReturnTo(url.searchParams.get("return_to") ?? "/");
  const token = parseCookie(request.headers.get("cookie"), SESSION_COOKIE_NAME);
  if (token) {
    try {
      await getDb().delete(authSessions).where(eq(authSessions.id, await hashSessionToken(token)));
    } catch (error) {
      console.error("Failed to delete application session", error);
    }
  }

  const platformUser = request.headers.get("oai-authenticated-user-id");
  const destination = platformUser
    ? new URL(`/signout-with-chatgpt?return_to=${encodeURIComponent(returnTo)}`, url.origin)
    : new URL(returnTo, url.origin);
  const response = NextResponse.redirect(destination, 303);
  response.cookies.set(SESSION_COOKIE_NAME, "", { httpOnly: true, secure: url.protocol === "https:", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return null;
}
