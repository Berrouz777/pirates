import { clientsClaim } from 'workbox-core'
import { registerRoute } from 'workbox-routing'
import { ExpirationPlugin } from 'workbox-expiration'
import { cleanupOutdatedCaches } from 'workbox-precaching'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'

const WEEK = 60 * 60 * 24 * 7
const MONTH = 60 * 60 * 24 * 30

clientsClaim()
cleanupOutdatedCaches()

self.addEventListener('install', function () {
    self.skipWaiting()
})

// Static assets
registerRoute(
    ({ url, request }) =>
        request.destination === 'script' ||
        request.destination === 'style' ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname.startsWith('/static/'),
    new StaleWhileRevalidate({
        cacheName: 'winnery-game-cache-static',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 2000,
                maxAgeSeconds: WEEK
            })
        ]
    })
)

// Images
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'winnery-game-cache-images',
        plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: MONTH })]
    })
)

// Fonts
registerRoute(
    ({ url, request }) =>
        request.destination === 'font' ||
        (request.destination === 'style' && url.origin.includes('fonts.googleapis.com')) ||
        (request.destination === 'font' && url.origin.includes('fonts.gstatic.com')),
    new CacheFirst({
        cacheName: 'winnery-game-cache-fonts',
        plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: MONTH })]
    })
)
