// Simple offline cache. Bump CACHE when you change any file.
const CACHE = "export-dashboard-v1";
const SHELL = ["./", "index.html", "css/style.css", "js/app.js", "js/data.js", "manifest.webmanifest",
  "icons/logo-192.png", "icons/logo-512.png", "icons/logo-512-maskable.png", "icons/favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request))
  );
});
