const OFFLINE_VERSION = 1
const CACHE_NAME = "offline"
const OFFLINE_URL = "/offline.html"

self.addEventListener("install", ev => {
    ev.waitUntil(cacheOfflinePage())
    self.skipWaiting()
})

async function cacheOfflinePage() {
    const cache = await caches.open(CACHE_NAME)
    await cache.add(new Request(OFFLINE_URL, { cache: "reload" }))
}

self.addEventListener("activate", ev => {
    ev.waitUntil(enableNavigationPreload())
    self.clients.claim()
})

async function enableNavigationPreload() {
    if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable()
    }
}

self.addEventListener("fetch", ev => {
    if (ev.request.mode === "navigate") {
        ev.respondWith(networkWithOfflineNavigationFallback(ev))
    }
})
