const VERSION = 'v9.5'
const CACHE_NAME = `rapid-recap-${VERSION}`
const ASSETS_CACHE = `assets-${VERSION}`
const DYNAMIC_CACHE = `dynamic-${VERSION}`

const RapidRecapLogo = './images/rrlogo.webp'
const RRBadge = './images/rrlogo_notif_badge.png'
const IS_DEVELOPMENT =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'

// Add list of domains that should never be cached
const NEVER_CACHE_DOMAINS = [
  'www.google-analytics.com',
  'analytics.google.com',
  'www.googletagmanager.com',
  'stats.g.doubleclick.net',
]

const URLS_TO_CACHE = [
  '/locales/en/components/headerFooter/Navbar.json',
  '/locales/en/components/articleComponents/Sidebar.json',
  '/locales/hi/components/articleComponents/Sidebar.json',
  '/locales/en/components/quizComponents/SubmittedQuizInterface.json',
  '/locales/hi/components/quizComponents/SubmittedQuizInterface.json',
  '/locales/en/screens/LeaderBoard.json',
  '/locales/hi/screens/LeaderBoard.json',
  '/manifest.json',
  '/images/screenshots/desktop1.png',
  '/images/screenshots/mobile1.png',
]

// Function to get all files from a directory with specific extensions
const getFilesFromPublicDirectory = async () => {
  try {
    // We can't directly access filesystem, so we need to maintain a list of paths
    const imageFiles = [
      './images/rrlogo.webp',
      './images/rrlogo_512.png',
      './images/rrlogo_badge.png',
      './images/tourBGDark.webp',
      './images/landingPage/articleUI.webp',
      './images/landingPage/featureBg.webp',
      './images/landingPage/featureBgMobile.webp',
      './images/landingPage/homeUI.webp',
      './images/landingPage/QuizReportUI.webp',
      './images/landingPage/quizUI.webp',
      './images/landingPage/tournamentUI.webp',
      // Add paths of other images you want to cache
    ]

    return imageFiles
  } catch (error) {
    console.error('Error getting image files:', error)
    return []
  }
}
// Assets that should be cached immediately
const STATIC_ASSETS = [
  // Original paths
  '/',
  './index.html',
  './manifest.json',
  './splash.html',
  './styles/main.css',
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
  './styles/components/css-splash.css',
]

// Function to check if URL should be cached
function shouldCache(url) {
  // Immediately return false if in development mode
  if (IS_DEVELOPMENT) {
    console.log('Development mode: Caching disabled')
    return false
  }

  try {
    const requestURL = new URL(url)

    // Don't cache chrome-extension URLs
    if (requestURL.protocol === 'chrome-extension:') return false

    // Don't cache analytics and tracking
    if (NEVER_CACHE_DOMAINS.includes(requestURL.hostname)) return false

    // Don't cache URLs with auth tokens
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

// Modified installation handler with cache busting
self.addEventListener('install', event => {
  console.log('Service Worker installing - Version', VERSION)
  if (IS_DEVELOPMENT) {
    event.waitUntil(self.skipWaiting())
    return
  }

  event.waitUntil(
    (async () => {
      try {
        // Delete old caches first
        const keys = await caches.keys()
        await Promise.all(
          keys.map(key => {
            if (key !== ASSETS_CACHE) {
              return caches.delete(key)
            }
          }),
        )

        // Open new cache
        const cache = await caches.open(ASSETS_CACHE)

        // Add cache busting parameter to static assets
        const assetsWithVersion = STATIC_ASSETS.map(asset => {
          const url = new URL(asset, self.location)
          url.searchParams.set('v', VERSION)
          return url.toString()
        })

        // Cache files with network-first strategy
        for (const asset of assetsWithVersion) {
          try {
            const response = await fetch(asset, {
              cache: 'reload',
              headers: {
                'Cache-Control': 'no-cache',
              },
            })
            if (response.ok) {
              await cache.put(asset, response)
            }
          } catch (error) {
            console.warn(`Failed to cache asset ${asset}:`, error)
          }
        }

        // Handle image files
        try {
          const imageFiles = await getFilesFromPublicDirectory()
          for (const imageFile of imageFiles) {
            try {
              const imageUrl = new URL(imageFile, self.location)
              imageUrl.searchParams.set('v', VERSION)
              const response = await fetch(imageUrl.toString(), {
                cache: 'reload',
                headers: {
                  'Cache-Control': 'no-cache',
                },
              })
              if (response.ok) {
                await cache.put(imageFile, response)
              }
            } catch (error) {
              console.warn(`Failed to cache image ${imageFile}:`, error)
            }
          }
        } catch (error) {
          console.warn('Failed to get image files:', error)
        }

        await self.skipWaiting()
        console.log('Service Worker installed successfully')
      } catch (error) {
        console.error('Service Worker installation failed:', error)
        throw error
      }
    })(),
  )
})

// Modified activate event with proper cache cleanup
self.addEventListener('activate', event => {
  console.log('Service Worker activating - Version', VERSION)

  event.waitUntil(
    (async () => {
      try {
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

        // Take control of all clients
        await clients.claim()

        // Get all clients
        const allClients = await clients.matchAll()

        // For each client, fetch the URLs to trigger cache invalidation and reload
        for (const client of allClients) {
          try {
            // Fetch all URLs with cache-busting headers
            await Promise.all(
              URLS_TO_CACHE.map(url =>
                fetch(url, {
                  cache: 'reload',
                  headers: {
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                  },
                }),
              ),
            )

            // Navigate to reload the client
            client.navigate(client.url)
          } catch (error) {
            console.error('Error fetching cached files:', error)
            // Still try to reload the client
            client.navigate(client.url)
          }
        }
      } catch (error) {
        console.error('Error in service worker activation:', error)
        // Attempt to reload clients even if there was an error
        clients.matchAll().then(clients => {
          clients.forEach(client => client.navigate(client.url))
        })
      }
    })(),
  )
})

// Modified fetch event with stale-while-revalidate strategy
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  if (IS_DEVELOPMENT) return
  if (!shouldCache(event.request.url)) return

  if (
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    event.request.destination === 'image'
  ) {
    event.respondWith(
      (async () => {
        // Try cache first
        const cache = await caches.open(ASSETS_CACHE)
        const cachedResponse = await caches.match(event.request)

        // Fetch new version in background
        const fetchPromise = fetch(event.request, {
          cache: 'reload',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
          .then(async networkResponse => {
            if (networkResponse.ok) {
              // Update cache with new version
              await cache.put(event.request, networkResponse.clone())
            }
            return networkResponse
          })
          .catch(error => {
            console.error('Network fetch failed:', error)
            return cachedResponse || caches.match('/offline.html')
          })

        // Return cached version immediately if available
        return cachedResponse || fetchPromise
      })(),
    )
  }
})

// Add periodic cache validation
const CACHE_VALIDATION_INTERVAL = 60 * 60 * 1000 // 1 hour

setInterval(() => {
  if (!IS_DEVELOPMENT) {
    caches.keys().then(keys => {
      keys.forEach(key => {
        if (key.includes(VERSION)) {
          caches.open(key).then(cache => {
            cache.keys().then(requests => {
              requests.forEach(request => {
                fetch(request, {
                  cache: 'reload',
                  headers: {
                    'Cache-Control': 'no-cache',
                  },
                }).then(response => {
                  if (response.ok) {
                    cache.put(request, response)
                  }
                })
              })
            })
          })
        }
      })
    })
  }
}, CACHE_VALIDATION_INTERVAL)

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

// Listen for messages from the client
self.addEventListener('message', event => {
  try {
    if (event.data.type === 'SKIP_WAITING') {
      self.skipWaiting()
    }

    if (event.data.type === 'CACHE_INVALIDATE') {
      event.waitUntil(
        caches.keys().then(keys => {
          return Promise.all(
            keys.map(key => {
              console.log('Invalidating cache:', key)
              return caches.delete(key)
            }),
          )
        }),
      )
    }
  } catch (err) {
    console.error('Error handling message event:', err)
  }
})

// Error handling for uncaught errors
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error)
})

// Error handling for unhandled rejections
self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason)
})
