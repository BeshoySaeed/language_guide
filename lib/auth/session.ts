export const SESSION_COOKIE_NAME = "language_guide_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

export type NewSession = Readonly<{
  token: string;
  id: string;
  expiresAt: string;
}>;

export async function createSession(): Promise<NewSession> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = toBase64Url(bytes);
  const id = await hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1_000).toISOString();
  return { token, id, expiresAt };
}

export async function hashSessionToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function toBase64Url(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}
