// (A) FILES TO CACHE
const cName = "MyNotes",
cFiles = [
  // (A1) ICONS + FONTS
  "assets/favicon.png",
  "assets/icon-512.png",
  "assets/maticon.woff2",
  // (A2) CSS
  "assets/js-notes.css",
  // (A3) JS
  "assets/cb.js",
  "assets/js-notes.js",
  // (A4) MANIFEST
  "js-notes-manifest.json",
  // (A5) PAGES
  "js-notes.html",
  "form.inc",
  "home.inc"
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
