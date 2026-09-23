const RESERVED_PATHS = new Set(["/login", "/register", "/api/auth/logout", "/callback"]);

export function sanitizeReturnTo(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  if (RESERVED_PATHS.has(url.pathname) || url.pathname.startsWith("/api/auth/")) return "/";
  return `${url.pathname}${url.search}${url.hash}`;
}
