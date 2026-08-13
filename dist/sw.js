const CACHE_NAME = 'digital-contratos-v8';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css?v=2.4.2',
  '/logo-digital.png',
  '/logo-emive.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Apagando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia Network-First para todas as requisições estáticas locais (HTML, CSS, JS)
// Busca sempre a versão mais recente da rede. Caso esteja offline, recorre ao cache local.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignora completamente requisições para domínios externos (Firebase, APIs, Cloud Functions)
  if (url.origin !== location.origin) return;

  // Network-First para todos os arquivos da mesma origem (CSS, JS, HTML)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
