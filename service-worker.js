const CACHE_NAME = 'medquiz-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './cards/index.html',
    './cards/cards.css',
    './cards/script.js',
    './caça-palavras/index.html',
    './caça-palavras/caça-palavras.css',
    './caça-palavras/script.js',
    './crosswords/index.html',
    './crosswords/crossword.css',
    './crosswords/crossword.js',
    './hangman/index.html',
    './hangman/hangman.css',
    './hangman/hangman.js',
    './quiz/index.html',
    './quiz/quiz.css',
    './quiz/quiz.js',
    './vocabulary/vocabulary.html',
    './vocabulary/vocabulary.css',
    './vocabulary/vocabulary.js',
    './vocabulary/vocabularyViewer.js',
    './components/selectorsComponent.js',
    './web-app-manifest-192x192.png',
    './web-app-manifest-512x512.png',
    './site.webmanifest',
    './apple-touch-icon.png',
    './favicon-96x96.png',
    './favicon.ico',
    './favicon.svg',
];


// Evento de instalação do service worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando e cacheando recursos');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('Service Worker: Falha ao cachear recursos', error);
            })
    );
});

// Evento de ativação do service worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Ativando e limpando caches antigos');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Evento de fetch para intercepção de requisições
self.addEventListener('fetch', (event) => {
    console.log('Service Worker: Interceptando requisição para:', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    console.log('Service Worker: Respondendo com cache para:', event.request.url);
                    return response;
                }
                console.log('Service Worker: Fazendo fetch para:', event.request.url);
                return fetch(event.request)
                    .then((fetchResponse) => {
                        // Verifica se a resposta é válida
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }
                        // Clona a resposta para armazenar no cache
                        const responseToCache = fetchResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return fetchResponse;
                    });
            }).catch((error) => {
                console.error('Service Worker: Erro ao responder com cache ou fazer fetch:', error);
                // Opcional: Retornar uma página de fallback ou mensagem de erro
            })
    );
});
