// Service worker: tiene sul telefono solo i file di Banco IBA (l'app resta cifrata anche in cache).
const CACHE = "banco-iba-aba57c92da4c";
const FILES = ["./", "index.html", "lock.js", "lock.css", "app.enc", "manifest.webmanifest", "fonts/big-shoulders-display-latin-600-normal.woff2", "fonts/big-shoulders-display-latin-800-normal.woff2", "fonts/jetbrains-mono-latin-500-normal.woff2", "fonts/libre-franklin-latin-400-normal.woff2", "fonts/libre-franklin-latin-500-normal.woff2", "fonts/libre-franklin-latin-600-normal.woff2", "fonts/libre-franklin-latin-700-normal.woff2", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;  // niente da altri siti
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
