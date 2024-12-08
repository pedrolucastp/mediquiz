const CACHE_NAME = 'medquiz-cache-v1';
const urlsToCache = [
    '/mediquiz/',
    '/mediquiz/index.html',
    '/mediquiz/style.css',
    '/mediquiz/script.js',
    '/mediquiz/cards/index.html',
    '/mediquiz/cards/cards.css',
    '/mediquiz/cards/script.js',
    '/mediquiz/caça-palavras/index.html',
    '/mediquiz/caça-palavras/caça-palavras.css',
    '/mediquiz/caça-palavras/script.js',
    '/mediquiz/crosswords/index.html',
    '/mediquiz/crosswords/crossword.css',
    '/mediquiz/crosswords/crossword.js',
    '/mediquiz/hangman/index.html',
    '/mediquiz/hangman/hangman.css',
    '/mediquiz/hangman/hangman.js',
    '/mediquiz/quiz/index.html',
    '/mediquiz/quiz/quiz.css',
    '/mediquiz/quiz/quiz.js',
    '/mediquiz/vocabulary/vocabulary.html',
    '/mediquiz/vocabulary/vocabulary.css',
    '/mediquiz/vocabulary/vocabulary.js',
    '/mediquiz/vocabulary/vocabularyViewer.js',
    '/mediquiz/components/selectorsComponent.js',
    '/mediquiz/web-app-manifest-192x192.png',
    '/mediquiz/web-app-manifest-512x512.png',
    '/mediquiz/site.webmanifest',
    '/mediquiz/apple-touch-icon.png',
    '/mediquiz/favicon-96x96.png',
    '/mediquiz/favicon.ico',
    '/mediquiz/favicon.svg',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache).then(() => self.skipWaiting());
        })
    );
});

self.addEventListener('fetch', (event) => {
    console.log('Fetch request for:', event.request.url);
    event.respondWith(
        caches.match(event.request).then((response) => {
            return (
                response ||
                fetch(event.request).catch(() => {
                    if (event.request.mode === 'navigate') {
                        return caches.match('/mediquiz/index.html');
                    }
                })
            );
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});
