const CACHE_NAME = 'gps-tracking-cache-v1';
const TILE_CACHE_NAME = 'map-tiles-cache-v1';

// URLs для кеширования
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  // Добавьте другие важные ресурсы
];

// Кеширование тайлов карты
const cacheMapTile = (request: Request) => {
  return fetch(request).then(response => {
    if (!response || response.status !== 200) {
      return response;
    }

    const responseToCache = response.clone();

    caches.open(TILE_CACHE_NAME)
      .then(cache => {
        cache.put(request, responseToCache);
      });

    return response;
  });
};

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Проверяем, является ли запрос запросом тайла карты
  if (url.hostname === 'tile.openstreetmap.org') {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || cacheMapTile(request);
        })
    );
    return;
  }

  // Для остальных запросов используем стратегию "сначала сеть, затем кеш"
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/serviceWorker.js');
      console.log('ServiceWorker registration successful');
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  }
}; 