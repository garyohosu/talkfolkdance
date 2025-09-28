const CACHE_NAME = 'talk-folk-dance-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.ts',
  '/topics.js',
  '/styles/base.css',
  '/styles/card.css',
  '/styles/responsive.css',
  '/manifest.webmanifest'
];

// インストール時にキャッシュを設定
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチ時にキャッシュから返す
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュがあればそれを返す、なければネットワークから取得
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: 古いキャッシュを削除しています:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});