const CACHE_NAME = 'lifeaid-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/Logo-trans.webp',
    '/Hero.webp',
    '/Product.webp',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Use individual add with error handling
            return Promise.allSettled(
                STATIC_ASSETS.map((asset) =>
                    cache.add(asset).catch((err) => {
                        console.warn(`Failed to cache ${asset}:`, err);
                    })
                )
            );
        })
    );
    // Activate immediately
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name.startsWith('lifeaid-') && name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    // Take control immediately
    self.clients.claim();
});

// Fetch event - stale-while-revalidate for better performance
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip API calls and external resources
    const url = new URL(request.url);
    if (url.origin !== location.origin) return;

    // Skip chrome-extension and other non-http protocols
    if (!url.protocol.startsWith('http')) return;

    // For navigation requests (HTML pages), use network-first
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Only cache successful responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone).catch(() => { });
                        });
                    }
                    return response;
                })
                .catch(() => caches.match('/') || caches.match('/index.html'))
        );
        return;
    }

    // For assets, use cache-first with network fallback
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request)
                .then((networkResponse) => {
                    // Only cache successful, same-origin responses
                    if (
                        networkResponse.ok &&
                        networkResponse.type === 'basic' &&
                        !request.url.includes('/api/')
                    ) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone).catch(() => { });
                        });
                    }
                    return networkResponse;
                })
                .catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});
