const CACHE = "offline-framework-v1";

const FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/joel.png",
  "/icons/james.png"
];

// INSTALL: cache essential files
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES))
  );
});

// FETCH: serve from cache if offline
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});