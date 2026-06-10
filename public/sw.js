// Synapse Service Worker — минимальный, для установки PWA и кэша оболочки.
// Приложение завязано на сеть (DeepSeek, Supabase), поэтому динамику НЕ кэшируем:
// запросы к /api/*, /auth/*, Supabase и любые не-GET идут мимо SW (network-only).

const CACHE = "synapse-v1";

// Лёгкий app-shell, который полезно иметь офлайн.
const PRECACHE = [
  "/",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Динамические запросы, которые нельзя перехватывать/кэшировать.
function isBypassed(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.hostname.endsWith(".supabase.co")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Только GET того же origin и не из bypass-списка проходит через кэш.
  if (request.method !== "GET" || url.origin !== self.location.origin || isBypassed(url)) {
    return; // network-only, браузер обработает запрос напрямую
  }

  // network-first с откатом в кэш: свежий билд приоритетнее, но офлайн-оболочка доступна.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match("/"))
      )
  );
});
