// (A) CREATE/INSTALL CACHE
self.addEventListener("install", evt => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open("NotesPWA")
    .then(cache => cache.addAll([
      "assets/favicon.png",
      "assets/head-notes-pwa.webp",
      "assets/icon-512.png",
      "assets/js-notes-db.js",
      "assets/js-notes.js",
      "assets/js-notes.css",
      "assets/maticon.woff2",
      "CB-manifest.json",
      "js-notes.html"
    ]))
    .catch(err => console.error(err))
  );
});
 
// (B) CLAIM CONTROL INSTANTLY
self.addEventListener("activate", evt => self.clients.claim());

// (C) LOAD FROM CACHE FIRST, FALLBACK TO NETWORK IF NOT FOUND
self.addEventListener("fetch", evt => evt.respondWith(
  caches.match(evt.request).then(res => res || fetch(evt.request))
));