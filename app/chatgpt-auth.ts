import { and, eq, gt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import { authSessions, users } from "@/db/schema";
import { sanitizeReturnTo } from "@/lib/auth/return-to";
import { hashSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export type ChatGPTUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

const USER_ID_HEADER = "oai-authenticated-user-id";
const USER_EMAIL_HEADER = "oai-authenticated-user-email";
const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
const USER_FULL_NAME_ENCODING_HEADER =
  "oai-authenticated-user-full-name-encoding";
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";
const SIGN_IN_PATH = "/login";
const SIGN_OUT_PATH = "/api/auth/logout";
export { sanitizeReturnTo };

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  const userId = requestHeaders.get(USER_ID_HEADER);
  const email = requestHeaders.get(USER_EMAIL_HEADER);
  if (userId && email) {
    const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
    const fullName =
      encodedFullName &&
      requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
        ? safeDecodeURIComponent(encodedFullName)
        : null;

    return {
      userId,
      displayName: fullName ?? email,
      email,
      fullName,
    };
  }

  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const sessionId = await hashSessionToken(token);
    const [account] = await getDb()
      .select({ id: users.id, email: users.email, displayName: users.displayName })
      .from(authSessions)
      .innerJoin(users, eq(users.id, authSessions.userId))
      .where(and(eq(authSessions.id, sessionId), gt(authSessions.expiresAt, new Date().toISOString()), eq(users.status, "active")))
      .limit(1);
    if (!account) return null;
    return {
      userId: account.id,
      displayName: account.displayName ?? account.email,
      email: account.email,
      fullName: account.displayName,
    };
  } catch (error) {
    console.error("Failed to resolve application session", error);
    return null;
  }
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;

  redirect(chatGPTSignInPath(returnTo));
}

export function chatGPTSignInPath(returnTo: string): string {
  const safeReturnTo = sanitizeReturnTo(returnTo);
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  const safeReturnTo = sanitizeReturnTo(returnTo);
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
