const VERSION = 'v10.3' // Increment version to force update
const CACHE_NAME = `rapid-recap-${VERSION}`
const OFFLINE_CACHE = `offline-${VERSION}`
const DYNAMIC_CACHE = `dynamic-${VERSION}`

const RapidRecapLogo = './images/rrlogo.webp'
const RRBadge = './images/rrlogo_notif_badge.png'
const IS_DEVELOPMENT =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'

// Define domains that should never be cached
const NEVER_CACHE_DOMAINS = [
  'www.google-analytics.com',
  'analytics.google.com',
  'www.googletagmanager.com',
  'stats.g.doubleclick.net',
]

// Assets that should be handled by Cloudflare
// Don't intercept these to allow Cloudflare's CDN to handle them
const CLOUDFLARE_HANDLED_PATTERNS = [
  '/assets/',
  '.js',
  '.css',
  '.webp',
  '.png',
  '.jpg',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
]

// Critical resources for offline functionality only - minimal set
const OFFLINE_RESOURCES = [
  '/',
  '/index.html',
  '/splash.html',
  '/styles/components/css-splash.css',
  '/offline.html', // Create a simple offline page
  '/images/rrlogo_512.png',
  '/images/rrlogo.webp',
]

// Check if URL should be cached
function shouldCache(url) {
  // Skip caching in development
  if (IS_DEVELOPMENT) {
    return false
  }

  try {
    const requestURL = new URL(url)

    // Don't cache extension URLs
    if (requestURL.protocol === 'chrome-extension:') return false

    // Don't cache analytics/tracking
    if (NEVER_CACHE_DOMAINS.includes(requestURL.hostname)) return false

    // Don't cache URLs with tokens
    if (requestURL.search.includes('token=')) return false

    // NEVER cache ANY API requests - important fix
    if (requestURL.pathname.includes('/api/')) return false

    // Don't cache locale files
    if (requestURL.pathname.includes('/locales/')) return false

    return true
  } catch (err) {
    console.error('Error checking cache eligibility:', err)
    return false
  }
}

// Check if this request should be handled by Cloudflare instead of service worker
function shouldLetCloudflareHandle(url) {
  try {
    // Never let Cloudflare handle in development mode
    if (IS_DEVELOPMENT) return false

    // For all asset patterns, let Cloudflare handle it
    return CLOUDFLARE_HANDLED_PATTERNS.some(pattern => url.includes(pattern))
  } catch (err) {
    console.error('Error checking Cloudflare handling:', err)
    return false
  }
}

// Check if this is an API request that should never be cached or intercepted
function isApiRequest(url) {
  try {
    return url.includes('/api/')
  } catch (err) {
    console.error('Error checking API request:', err)
    return false
  }
}

// Purge locale files from all caches
async function purgeLocaleFilesFromCache() {
  try {
    const cacheKeys = await caches.keys()

    for (const cacheKey of cacheKeys) {
      const cache = await caches.open(cacheKey)
      const requests = await cache.keys()

      for (const request of requests) {
        if (request.url.includes('/locales/')) {
          await cache.delete(request)
        }
      }
    }
    return true
  } catch (error) {
    console.error('Error purging locale files:', error)
    return false
  }
}

// Purge all API request caches - important to prevent stale data
async function purgeApiCachesFromCache() {
  try {
    const cacheKeys = await caches.keys()

    for (const cacheKey of cacheKeys) {
      const cache = await caches.open(cacheKey)
      const requests = await cache.keys()

      for (const request of requests) {
        if (request.url.includes('/api/')) {
          console.log('Purging cached API request:', request.url)
          await cache.delete(request)
        }
      }
    }
    return true
  } catch (error) {
    console.error('Error purging API caches:', error)
    return false
  }
}

// Installation handler - focus only on offline support
self.addEventListener('install', event => {
  console.log('Service Worker installing - Version', VERSION)

  if (IS_DEVELOPMENT) {
    event.waitUntil(self.skipWaiting())
    return
  }

  event.waitUntil(
    (async () => {
      try {
        // Purge locale files from all caches
        await purgeLocaleFilesFromCache()

        // Purge any API caches that might exist from previous service worker versions
        await purgeApiCachesFromCache()

        // Only cache the minimal resources needed for offline functionality
        const offlineCache = await caches.open(OFFLINE_CACHE)

        // Process offline resources with high priority
        await Promise.all(
          OFFLINE_RESOURCES.map(async resource => {
            try {
              const response = await fetch(resource, {
                cache: 'reload',
                headers: {
                  'Cache-Control': 'no-cache',
                },
              })

              if (response.ok) {
                await offlineCache.put(resource, response)
              }
            } catch (error) {
              console.warn(
                `Failed to cache offline resource ${resource}:`,
                error,
              )
            }
          }),
        )

        await self.skipWaiting()
        console.log('Service Worker installed successfully')
      } catch (error) {
        console.error('Service Worker installation failed:', error)
        throw error
      }
    })(),
  )
})

// Activation handler
self.addEventListener('activate', event => {
  console.log('Service Worker activating - Version', VERSION)

  event.waitUntil(
    (async () => {
      try {
        // Purge locale files
        await purgeLocaleFilesFromCache()

        // Purge any API caches on activation as well
        await purgeApiCachesFromCache()

        // Clear old caches
        const keys = await caches.keys()
        await Promise.all(
          keys.map(key => {
            if (!key.includes(VERSION)) {
              console.log('Deleting old cache:', key)
              return caches.delete(key)
            }
          }),
        )

        // Take control immediately
        await clients.claim()

        // Notify clients about the update
        const allClients = await clients.matchAll()
        allClients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: VERSION,
          })
        })
      } catch (error) {
        console.error('Error in service worker activation:', error)
      }
    })(),
  )
})

// Optimized fetch handler that defers to Cloudflare for static assets
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return

  // Bypass service worker in development mode
  if (IS_DEVELOPMENT) return

  const url = event.request.url

  // Special handling for locale files - always network first
  if (url.includes('/locales/')) {
    event.respondWith(
      (async () => {
        try {
          // Try network first for locale files
          const networkResponse = await fetch(event.request, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            },
          })

          if (networkResponse.ok) {
            return networkResponse
          }

          // Fallback to cache if network fails
          const cachedResponse = await caches.match(event.request)
          return (
            cachedResponse ||
            new Response('Translation not available', {
              status: 404,
              statusText: 'Not Found',
            })
          )
        } catch (error) {
          const cachedResponse = await caches.match(event.request)
          return (
            cachedResponse ||
            new Response('Translation not available', {
              status: 404,
              statusText: 'Not Found',
            })
          )
        }
      })(),
    )
    return
  }

  // ***IMPORTANT***: Let Cloudflare handle static assets
  // Don't intercept requests for assets that should be handled by Cloudflare
  if (shouldLetCloudflareHandle(url)) {
    // Do not call event.respondWith() - this lets the request
    // continue to the network and be handled by Cloudflare
    return
  }

  // ***CRITICAL FIX***: NEVER intercept or cache API requests
  // Let them go directly to the server to ensure fresh data
  if (isApiRequest(url)) {
    // Do not call event.respondWith() - this lets the API request
    // continue to the network without service worker interference
    return
  }

  // Skip non-cacheable resources
  if (!shouldCache(url)) return

  // For HTML navigation requests, use network-first strategy with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try network first for HTML pages
          const networkResponse = await fetch(event.request)

          if (networkResponse.ok) {
            // Cache successful responses for offline support
            const cache = await caches.open(OFFLINE_CACHE)
            cache.put(event.request, networkResponse.clone())
            return networkResponse
          }

          // Fall back to cache if network fails
          const cachedResponse = await caches.match(event.request)
          return cachedResponse || networkResponse
        } catch (error) {
          // Network failure - try cache
          const cachedResponse = await caches.match(event.request)
          if (cachedResponse) return cachedResponse

          // If no cached version, serve offline page
          return (
            caches.match('/offline.html') ||
            new Response('You are offline', { status: 503 })
          )
        }
      })(),
    )
    return
  }

  // For any other resources not handled above, use a standard
  // network-first strategy with cache fallback
  event.respondWith(
    (async () => {
      try {
        // Try network first
        const networkResponse = await fetch(event.request)

        if (networkResponse.ok) {
          // Cache successful responses for later
          const cache = await caches.open(DYNAMIC_CACHE)
          cache.put(event.request, networkResponse.clone())
          return networkResponse
        }

        // Fall back to cache if network fails
        const cachedResponse = await caches.match(event.request)
        return cachedResponse || networkResponse
      } catch (error) {
        // Network failure - try cache
        const cachedResponse = await caches.match(event.request)
        return (
          cachedResponse ||
          new Response('Network error occurred', { status: 503 })
        )
      }
    })(),
  )
})

// Message handling
self.addEventListener('message', event => {
  try {
    if (event.data.type === 'SKIP_WAITING') {
      self.skipWaiting()
    }

    if (event.data.type === 'CACHE_INVALIDATE') {
      event.waitUntil(
        (async () => {
          console.log('Received CACHE_INVALIDATE event')
          // Purge all caches, including locale files
          const keys = await caches.keys()
          await Promise.all(
            keys.map(key => {
              console.log('Invalidating cache:', key)
              return caches.delete(key)
            }),
          )

          // Force reload all clients
          const allClients = await clients.matchAll()
          allClients.forEach(client => {
            client.navigate(client.url)
          })
        })(),
      )
    }

    // Handle locale updates
    if (event.data.type === 'LOCALE_UPDATED') {
      event.waitUntil(
        (async () => {
          console.log('Received LOCALE_UPDATED event')
          await purgeLocaleFilesFromCache()

          // Notify clients
          const allClients = await clients.matchAll()
          allClients.forEach(client => {
            client.postMessage({ type: 'LOCALE_REFRESH' })
          })
        })(),
      )
    }
  } catch (err) {
    console.error('Error handling message event:', err)
  }
})

// Push notification handling
self.addEventListener('push', event => {
  try {
    const data = event.data.json()

    if (data.messageId && data.title === 'Message Deleted') {
      // Handle message deletion
      event.waitUntil(
        self.registration.getNotifications().then(notifications => {
          notifications.forEach(notification => {
            if (
              notification.data &&
              notification.data.messageId === data.messageId
            ) {
              notification.close()
            }
          })
        }),
      )
      return
    }

    const notificationOptions = {
      body: data.body,
      icon: data.icon || RapidRecapLogo,
      image: data.image || null,
      data: { url: data.url },
      badge: RRBadge,
      vibrate: [200, 100, 200],
      tag: data.messageId, // Add tag for notification management
    }

    event.waitUntil(
      self.registration.showNotification(data.title, notificationOptions),
    )
  } catch (err) {
    console.error('Error handling push event:', err)
  }
})

self.addEventListener('notificationclick', event => {
  try {
    const notificationData = event.notification.data

    event.waitUntil(
      Promise.all([
        // Close the notification
        event.notification.close(),
        // Open the URL if provided
        notificationData?.url && clients.openWindow(notificationData.url),
      ]),
    )
  } catch (err) {
    console.error('Error handling notification click:', err)
  }
})

// Error handling
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error)
})

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason)
})

// Add background sync for offline support
self.addEventListener('sync', event => {
  if (event.tag === 'sync-user-data') {
    event.waitUntil(
      // Sync user data when online
      clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SYNC_USER_DATA' })
        })
      }),
    )
  }
})

// Periodically check for and remove any accidentally cached API requests
setInterval(() => {
  if (!IS_DEVELOPMENT) {
    // Ensure no API requests are cached
    purgeApiCachesFromCache()

    // Just ensure offline resources are still available
    caches.open(OFFLINE_CACHE).then(cache => {
      OFFLINE_RESOURCES.forEach(resource => {
        fetch(resource, { cache: 'reload' })
          .then(response => {
            if (response.ok) {
              cache.put(resource, response)
            }
          })
          .catch(err => {
            // Ignore errors in background refresh
          })
      })
    })
  }
}, 24 * 60 * 60 * 1000) // Once a day
