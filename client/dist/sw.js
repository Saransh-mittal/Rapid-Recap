const VERSION = 'v10.0' // Increment version to force update
const CACHE_NAME = `rapid-recap-${VERSION}`
const ASSETS_CACHE = `assets-${VERSION}`
const DYNAMIC_CACHE = `dynamic-${VERSION}`
const CRITICAL_CACHE = `critical-${VERSION}` // New separate cache for critical resources

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

// Critical resources that should be cached first and always served from cache if available
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/splash.html',
  '/styles/components/css-splash.css',
  '/styles/main.css',
  '/src/entry-client.jsx',
  '/images/rrlogo_512.png',
  '/images/rrlogo.webp',
]

// Secondary important assets that should be cached but aren't required for initial render
const IMPORTANT_ASSETS = [
  './manifest.json',
  './styles/utils/reset.css',
  './styles/utils/variables.css',
  './styles/utils/responsive.css',
  './styles/components/css-article.css',
  './styles/components/css-benefits.css',
  './styles/components/css-features.css',
  './styles/components/css-footer.css',
  './styles/components/css-hero.css',
  './styles/components/css-navigation.css',
  './styles/components/css-sections.css',
]

// Add non-critical assets that can be loaded later
const BACKGROUND_ASSETS = [
  './images/tourBGDark.webp',
  './images/landingPage/articleUI.webp',
  './images/landingPage/featureBg.webp',
  './images/landingPage/featureBgMobile.webp',
  './images/landingPage/homeUI.webp',
  './images/landingPage/QuizReportUI.webp',
  './images/landingPage/quizUI.webp',
  './images/landingPage/tournamentUI.webp',
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

    // Don't cache API requests
    if (requestURL.pathname.includes('/api/')) return false

    // Don't cache locale files
    if (requestURL.pathname.includes('/locales/')) return false

    return true
  } catch (err) {
    console.error('Error checking cache eligibility:', err)
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

// Enhanced installation handler
self.addEventListener('install', event => {
  console.log('Service Worker installing - Version', VERSION)

  if (IS_DEVELOPMENT) {
    event.waitUntil(self.skipWaiting())
    return
  }

  event.waitUntil(
    (async () => {
      try {
        // Purge locale files from all caches first
        await purgeLocaleFilesFromCache()

        // Cache critical resources first (highest priority)
        const criticalCache = await caches.open(CRITICAL_CACHE)

        // Process critical resources with high priority
        await Promise.all(
          CRITICAL_RESOURCES.map(async resource => {
            try {
              const response = await fetch(resource, {
                cache: 'reload',
                headers: {
                  'Cache-Control': 'no-cache',
                  Priority: 'high',
                },
              })

              if (response.ok) {
                await criticalCache.put(resource, response)
              }
            } catch (error) {
              console.warn(
                `Failed to cache critical resource ${resource}:`,
                error,
              )
            }
          }),
        )

        // Cache regular assets with normal priority (done in background)
        const assetsCache = await caches.open(ASSETS_CACHE)

        // Process important assets
        IMPORTANT_ASSETS.forEach(asset => {
          fetch(asset, { cache: 'reload' })
            .then(response => {
              if (response.ok) {
                return assetsCache.put(asset, response)
              }
            })
            .catch(error => {
              console.warn(`Failed to cache asset ${asset}:`, error)
            })
        })

        // Process background assets with lower priority
        setTimeout(() => {
          BACKGROUND_ASSETS.forEach(asset => {
            fetch(asset)
              .then(response => {
                if (response.ok) {
                  return assetsCache.put(asset, response)
                }
              })
              .catch(error => {
                console.warn(
                  `Failed to cache background asset ${asset}:`,
                  error,
                )
              })
          })
        }, 5000) // Delay by 5 seconds to prioritize critical resources

        await self.skipWaiting()
        console.log('Service Worker installed successfully')
      } catch (error) {
        console.error('Service Worker installation failed:', error)
        throw error
      }
    })(),
  )
})

// Enhanced activate event
self.addEventListener('activate', event => {
  console.log('Service Worker activating - Version', VERSION)

  event.waitUntil(
    (async () => {
      try {
        // Purge locale files
        await purgeLocaleFilesFromCache()

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

// Enhanced fetch handler with optimized strategies
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
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

  // Skip non-cacheable resources
  if (!shouldCache(url)) return

  // Check if this is a critical resource
  const isCriticalResource = CRITICAL_RESOURCES.some(
    resource => url.endsWith(resource) || url.includes(resource),
  )

  if (isCriticalResource) {
    // Cache-first strategy for critical resources
    event.respondWith(
      (async () => {
        // Check critical cache first
        const criticalCache = await caches.open(CRITICAL_CACHE)
        const cachedResponse = await caches.match(event.request, {
          cacheName: CRITICAL_CACHE,
        })

        if (cachedResponse) {
          // Return cached version immediately

          // Refresh the cache in the background (for next time)
          fetch(event.request)
            .then(networkResponse => {
              if (networkResponse.ok) {
                criticalCache.put(event.request, networkResponse)
              }
            })
            .catch(() => {
              // Ignore background refresh failures
            })

          return cachedResponse
        }

        // If not in critical cache, try to fetch
        try {
          const networkResponse = await fetch(event.request)

          if (networkResponse.ok) {
            // Cache the response for next time
            const clonedResponse = networkResponse.clone()
            criticalCache.put(event.request, clonedResponse)
          }

          return networkResponse
        } catch (error) {
          // Try other caches as fallback
          return (
            caches.match(event.request) ||
            new Response('Resource unavailable offline', { status: 503 })
          )
        }
      })(),
    )
    return
  }

  // For style, script, and image resources - use stale-while-revalidate strategy
  if (
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    event.request.destination === 'image'
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSETS_CACHE)
        const cachedResponse = await caches.match(event.request)

        // Start network fetch in background
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse.ok) {
              // Update cache with new version
              cache.put(event.request, networkResponse.clone())
            }
            return networkResponse
          })
          .catch(error => {
            return cachedResponse || caches.match('/offline.html')
          })

        // Return cached version immediately if available
        return cachedResponse || fetchPromise
      })(),
    )
    return
  }

  // Default strategy for other resources - network first with cache fallback
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

// Enhanced message handling
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

    // Handle returning user optimization
    if (event.data.type === 'RETURNING_USER') {
      event.waitUntil(
        (async () => {
          console.log('Optimizing for returning user')
          // Ensure critical resources are cached
          const criticalCache = await caches.open(CRITICAL_CACHE)

          // Pre-warm critical cache for faster startup
          CRITICAL_RESOURCES.forEach(resource => {
            fetch(resource, { priority: 'high' })
              .then(response => {
                if (response.ok) {
                  return criticalCache.put(resource, response)
                }
              })
              .catch(err => {
                // Ignore errors in background caching
              })
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

// Periodic maintenance
setInterval(() => {
  if (!IS_DEVELOPMENT) {
    // Refresh critical cache periodically
    caches.open(CRITICAL_CACHE).then(cache => {
      CRITICAL_RESOURCES.forEach(resource => {
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
