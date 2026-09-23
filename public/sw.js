const CACHE_VERSION = "language-guide-v2";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const SAFE_FALLBACK = "/offline";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.add(SAFE_FALLBACK)).catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key)))),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_OFFLINE_URLS" || !Array.isArray(event.data.urls)) return;
  event.waitUntil(
    cacheExplicitUrls(event.data.urls).then(
      () => event.ports[0]?.postMessage({ ok: true }),
      () => event.ports[0]?.postMessage({ ok: false }),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(navigationResponse(request));
    return;
  }

  if (["script", "style", "font", "image"].includes(request.destination) || url.pathname === "/manifest.webmanifest") {
    event.respondWith(networkFirstAsset(request));
  }
});

async function navigationResponse(request) {
  const url = new URL(request.url);
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (url.pathname.startsWith("/offline")) await cache.put(request, response.clone());
    return response;
  } catch {
    if (url.pathname.startsWith("/offline/lesson")) {
      const lessonShell = await cache.match("/offline/lesson", { ignoreSearch: true });
      if (lessonShell) return lessonShell;
    }
    return (await cache.match(SAFE_FALLBACK, { ignoreSearch: true })) ?? Response.error();
  }
}

async function networkFirstAsset(request) {
  const cache = await caches.open(ASSET_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await caches.match(request)) ?? Response.error();
  }
}

async function cacheExplicitUrls(urls) {
  const cache = await caches.open(SHELL_CACHE);
  for (const value of urls) {
    const url = new URL(value, self.location.origin);
    if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) continue;
    const response = await fetch(url.href, { credentials: "same-origin" });
    if (!response.ok) throw new Error("An offline resource could not be cached.");
    await cache.put(url.href, response);
  }
}
