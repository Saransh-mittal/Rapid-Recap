const path = require('path')
const fs = require('fs').promises
const cache = require('memory-cache')
const express = require('express')
const { createHash } = require('crypto')

// Increased cache duration for better performance
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
const SPLASH_CACHE_KEY = 'splash-content'
const TEMPLATE_CACHE_KEY = 'index-template'
const RETURN_VISITOR_HTML_KEY = 'return-visitor-html'

// Generate content hash for cache invalidation
async function getFileHash(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return createHash('md5').update(content).digest('hex').slice(0, 8)
  } catch (error) {
    console.error(`Error hashing file ${filePath}:`, error)
    return Date.now().toString()
  }
}

// Optimized splash content retrieval
async function getSplashContent() {
  try {
    const cachedContent = cache.get(SPLASH_CACHE_KEY)
    if (cachedContent) {
      return cachedContent
    }

    const filePath = path.resolve(__dirname, '../client/dist/splash.html')
    const content = await fs.readFile(filePath, 'utf-8')

    // Add hash for cache busting
    const contentHash = await getFileHash(filePath)
    const cachedValue = { content, hash: contentHash }

    cache.put(SPLASH_CACHE_KEY, cachedValue, CACHE_DURATION)
    return cachedValue
  } catch (error) {
    console.error('Error reading splash content:', error)
    return { content: '', hash: '' }
  }
}

// Optimized index template retrieval
async function getIndexTemplate() {
  try {
    const cachedTemplate = cache.get(TEMPLATE_CACHE_KEY)
    if (cachedTemplate) {
      return cachedTemplate
    }

    const filePath = path.resolve(__dirname, '../client/dist/index.html')
    const template = await fs.readFile(filePath, 'utf-8')

    // Add hash for cache busting
    const templateHash = await getFileHash(filePath)
    const cachedValue = { template, hash: templateHash }

    cache.put(TEMPLATE_CACHE_KEY, cachedValue, CACHE_DURATION)
    return cachedValue
  } catch (error) {
    console.error('Error reading index template:', error)
    return { template: '', hash: '' }
  }
}

// Create optimized HTML for returning visitors
async function createReturnVisitorHTML() {
  try {
    const { template } = await getIndexTemplate()
    const { content: splashContent } = await getSplashContent()

    // Create enhanced template with optimizations for returning visitors:
    // 1. Include splash screen HTML but add script to hide it immediately
    // 2. Add prefetch hints for critical resources
    // 3. Add return visitor flag

    const returnVisitorHTML = template
      .replace('<!--ssr-outlet-->', '')
      .replace('<div id="splash-screen">', splashContent)
      .replace(
        '</head>',
        `
        <!-- Critical resources prefetch -->
        <link rel="prefetch" href="/src/redux/store.js">
        <link rel="prefetch" href="/src/customHooks/useSocket.js">
        <link rel="prefetch" href="/src/contextAPI/SocketContext.jsx">

        <script>
          // Immediately hide splash screen for returning visitors
          document.addEventListener('DOMContentLoaded', () => {
            const splash = document.getElementById('splash-screen');
            if (splash) splash.style.display = 'none';

            // Store returning visitor status
            localStorage.setItem('has_visited_before', 'true');

            // Signal to service worker that this is a returning user
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'RETURNING_USER'
              });
            }
          });
        </script>
        </head>
      `,
      )

    // Cache the optimized HTML
    cache.put(RETURN_VISITOR_HTML_KEY, returnVisitorHTML, CACHE_DURATION)
    return returnVisitorHTML
  } catch (error) {
    console.error('Error creating returning visitor HTML:', error)
    throw error
  }
}

// Determine if request is from a bot
function isBot(userAgent) {
  if (!userAgent) return false

  const botPatterns = [
    'googlebot',
    'bingbot',
    'yandex',
    'baiduspider',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest',
    'slackbot',
    'vkShare',
    'W3C_Validator',
    'crawl',
    'spider',
    'bot',
    'crawler',
  ]

  const lowerUA = userAgent.toLowerCase()
  return botPatterns.some(pattern => lowerUA.includes(pattern))
}

// Enhanced CSS handling with optimized caching
async function handleCSSRequest(req, res, next, cssPath) {
  try {
    const stats = await fs.stat(cssPath)

    // Use file stats for efficient ETag
    const etag = `W/"${stats.size}-${stats.mtime.getTime()}"`

    // Check if client has valid cached version
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end()
    }

    const cssContent = await fs.readFile(cssPath, 'utf-8')

    res.setHeader('Content-Type', 'text/css')
    res.setHeader('ETag', etag)
    res.setHeader('Cache-Control', 'public, max-age=31536000')

    return res.status(200).send(cssContent)
  } catch (error) {
    console.error('Error handling CSS file:', error)
    return next(error)
  }
}

// Setup static file handling
function setupStaticHandling(app) {
  const distPath = path.join(__dirname, '../client/dist')

  // Configure caching options based on file type
  const staticOptions = {
    setHeaders: (res, filePath) => {
      if (filePath.includes('/locales/')) {
        res.setHeader('Cache-Control', 'no-store, must-revalidate')
        return
      }

      if (
        filePath.includes('-sw.js') ||
        filePath.endsWith('service-worker.js')
      ) {
        res.setHeader('Service-Worker-Allowed', '/')
        res.setHeader('Cache-Control', 'no-cache')
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000')
      }
    },
    index: false,
    maxAge: '1y',
    etag: true,
    lastModified: true,
  }

  // Serve translation files with no-cache headers
  app.use(
    '/locales',
    express.static(path.join(distPath, 'locales'), {
      ...staticOptions,
      setHeaders: res => {
        res.setHeader('Cache-Control', 'no-store, must-revalidate')
      },
    }),
  )

  // Serve CSS with appropriate content type
  app.use(
    '/styles',
    express.static(path.join(distPath, 'styles'), {
      ...staticOptions,
      setHeaders: res => res.setHeader('Content-Type', 'text/css'),
    }),
  )

  // Serve static assets with long cache times
  app.use(express.static(distPath, staticOptions))
  app.use(
    '/assets',
    express.static(path.join(distPath, 'assets'), staticOptions),
  )
  app.use(
    '/images',
    express.static(path.join(distPath, 'images'), staticOptions),
  )
}

// Check if URL should skip SSR
function shouldSkipService(url) {
  const skipPaths = [
    '/auth/google',
    '/api/user/google/callback',
    '/oauth2/callback',
    '/signin/oauth',
    '/api/auth/google',
    '/callback',
    '/oauth2/v2/auth',
    '/oauth2/v1/certs',
    '/gsi/client',
    '/api/push',
    '/api/notifications',
    '/api/notify',
    '/service-worker.js',
    '/sw.js',
    '/firebase-messaging-sw.js',
    '/push-manifest.json',
  ]

  return (
    skipPaths.some(path => url.includes(path)) ||
    url.includes('oauth') ||
    url.includes('gsi') ||
    url.includes('accounts.google.com') ||
    url.includes('/push') ||
    url.includes('/subscribe') ||
    url.includes('/notifications') ||
    url.endsWith('.js.map') ||
    url.endsWith('-sw.js')
  )
}

// Check if URL should skip SSR for static files
function shouldSkipSSR(url) {
  return (
    url.match(
      /\.(webp|js|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
    ) ||
    url.startsWith('/assets/') ||
    url.startsWith('/images/') ||
    url.startsWith('/styles/') ||
    url === '/manifest.json' ||
    url === '/robots.txt' ||
    url === '/sitemap.xml' ||
    url.includes('firebase-messaging-sw.js') ||
    url.includes('service-worker.js') ||
    url.includes('sw.js') ||
    url.includes('google-news-sitemap.xml')
  )
}

// Main middleware creator function
async function createSSRMiddleware(app) {
  try {
    // Pre-generate optimized HTML for returning visitors
    const returnVisitorHTML = await createReturnVisitorHTML()

    // Setup static file handling
    setupStaticHandling(app)

    return async (req, res, next) => {
      const url = req.originalUrl

      // Skip SSR for service-specific routes
      if (shouldSkipService(url)) {
        return next()
      }

      // Handle CSS files specifically
      if (url.endsWith('.css')) {
        const cssPath = path.join(__dirname, '../client/dist', url)
        return handleCSSRequest(req, res, next, cssPath)
      }

      // Skip SSR for other static files
      if (shouldSkipSSR(url)) {
        return next()
      }

      // Detect if this is a bot request
      const userAgent = req.headers['user-agent']
      const botRequest = isBot(userAgent)

      // Check for returning visitor
      const isReturningVisitor = req.cookies.visited === 'true' && !botRequest

      try {
        // For returning visitors, use optimized HTML
        if (isReturningVisitor) {
          const returnHTML =
            cache.get(RETURN_VISITOR_HTML_KEY) ||
            (await createReturnVisitorHTML())

          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.setHeader('Cache-Control', 'private, max-age=60')
          return res.status(200).end(returnHTML)
        }

        // For new visitors or bots, use standard approach
        const [splashData, templateData] = await Promise.all([
          getSplashContent(),
          getIndexTemplate(),
        ])

        const processedTemplate = templateData.template
          .replace('<!--ssr-outlet-->', '')
          .replace('<div id="splash-screen">', splashData.content)
          .replace(
            '<style>',
            `<link rel="stylesheet" href="/styles/components/css-splash.css"><style>`,
          )
          .replace(
            '</head>',
            `
            <script>
              // Set returning visitor flag
              localStorage.setItem('has_visited_before', 'true');
            </script>
            </head>
          `,
          )

        // Set cookie for returning visitors
        res.cookie('visited', 'true', {
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
          httpOnly: true,
          sameSite: 'lax',
        })

        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Cache-Control', 'private, max-age=60')
        return res.status(200).end(processedTemplate)
      } catch (error) {
        console.error('Error rendering HTML:', error)
        next(error)
      }
    }
  } catch (e) {
    console.error('Failed to create SSR middleware:', e)
    throw e
  }
}

module.exports = { createSSRMiddleware }
