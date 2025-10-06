const CACHE_NAME = "km-media-v2";
const urlsToCache = [
  "/",
  "/images/logo.jpeg",
  "/images/1.jpeg",
  "/images/2.jpeg",
  "/images/3.jpeg",
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache).catch((error) => {
        console.log("Cache addAll failed:", error);
        // If addAll fails, try adding items individually
        return Promise.all(
          urlsToCache.map((url) =>
            cache.add(url).catch((err) => {
              console.log(`Failed to cache ${url}:`, err);
              return null;
            })
          )
        );
      });
    })
  );
});

// Fetch event - serve from cache, fallback to network
// Skip caching for Next.js development files to prevent interference with HMR
self.addEventListener("fetch", (event) => {
  // Skip service worker caching for Next.js assets and localhost development
  if (
    event.request.url.includes("_next") ||
    event.request.url.includes("localhost:3000") ||
    event.request.url.includes("localhost:3001")
  ) {
    // Let the request pass through normally without service worker intervention
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions when connection is restored
  console.log("Background sync triggered");
  // Implementation would depend on specific offline actions
}
