// (A) FILES TO CACHE
const cName = "MyNotes",
cFiles = [
  "assets/favicon.png",
  "assets/icon-512.png",
  "assets/js-notes.css",
  "assets/js-notes.js",
  "assets/maticon.woff2",
  "js-notes-manifest.json",
  "js-notes.html"
];

// (B) CREATE/INSTALL CACHE
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(cName)
    .then((cache) => { return cache.addAll(cFiles); })
    .catch((err) => { console.error(err) })
  );
});

// (C) LOAD FROM CACHE, FALLBACK TO NETWORK IF NOT FOUND
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request)
    .then((res) => { return res || fetch(evt.request); })
  );
});
