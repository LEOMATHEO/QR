// Simples service worker para cache offline
const CACHE = 'qr-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(res => res || fetch(req).then(net => {
      // cache novos GETs
      if (req.method === 'GET' && net.ok) {
        const clone = net.clone();
        caches.open(CACHE).then(c => c.put(req, clone));
      }
      return net;
    }).catch(()=> caches.match('./index.html')))
  );
});
