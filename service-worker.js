// service-worker.js

const CACHE_NAME = 'medquiz-cache-v1';
const urlsToCache = [
    '/',
    // '/service-worker.js'
    '/index.html',
    '/style.css',
    '/script.js',
    '/cards/index.html',
    '/cards/cards.css',
    '/cards/script.js',
    '/caça-palavras/index.html',
    '/caça-palavras/caça-palavras.css',
    '/caça-palavras/script.js',
    '/crosswords/index.html',
    '/crosswords/crossword.css',
    '/crosswords/crossword.js',
    '/hangman/index.html',
    '/hangman/hangman.css',
    '/hangman/hangman.js',
    '/quiz/index.html',
    '/quiz/quiz.css',
    '/quiz/quiz.js',
    '/vocabulary/vocabulary.html',
    '/vocabulary/vocabulary.css',
    '/vocabulary/vocabulary.js',
    '/vocabulary/vocabularyViewer.js',
    '/components/selectorsComponent.js',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap',
    '/web-app-manifest-192x192.png',
    '/web-app-manifest-512x512.png',
    '/site.webmanifest',
    '/apple-touch-icon.png',
    '/favicon-96x96.png',
    '/favicon.ico',
    '/favicon.svg',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Cache aberto');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
