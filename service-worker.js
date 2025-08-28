
const CACHE_NAME = 'compr-as-cache-v2.5'; // Versión actualizada
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/productos.json',
    '/tiendas.json',
    '/manifest.json',
    '/images/icon-192.png',
    '/images/icon-512.png',
    // Módulos de JS
    '/js/api.js',
    '/js/dom.js',
    '/js/events.js',
    '/js/render.js',
    '/js/state.js',
    '/js/utils.js',
    // Librerías locales
    '/libs/bootstrap/bootstrap.min.css',
    '/libs/bootstrap-icons/bootstrap-icons.min.css',
    '/libs/bootstrap-icons/fonts/bootstrap-icons.woff',
    '/libs/bootstrap-icons/fonts/bootstrap-icons.woff2',
    '/libs/bootstrap/bootstrap.bundle.min.js',
    '/libs/jspdf/jspdf.umd.min.js',
    '/libs/html2canvas/html2canvas.min.js'
];

self.addEventListener('install', event => {
    console.log('[Service Worker] Instalando nueva versión...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Cache abierto. Cacheando archivos principales.');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('[Service Worker] Falló el cacheo de archivos durante la instalación:', err);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activando nueva versión...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Limpiando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
