const path = require('path')
const fs = require('fs').promises
const cache = require('memory-cache')
const express = require('express')

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function getSplashContent() {
  try {
    const cachedContent = cache.get('splash-content')
    if (cachedContent) {
      return cachedContent
    }

    const content = await fs.readFile(
      path.resolve(__dirname, '../client/dist/splash.html'),
      'utf-8',
    )
    cache.put('splash-content', content, CACHE_DURATION)
    return content
  } catch (error) {
    console.error('Error reading splash content:', error)
    return ''
  }
}

async function createSSRMiddleware(app) {
  try {
    // Setup static file handling first
    setupStaticHandling(app)

    return async (req, res, next) => {
      const url = req.originalUrl

      // Skip SSR for service-specific routes
      if (shouldSkipService(url)) {
        return next()
      }

      // Handle CSS files specifically
      if (url.endsWith('.css')) {
        return handleCSSRequest(req, res, next)
      }

      // Skip SSR for other static files
      if (shouldSkipSSR(url)) {
        return next()
      }

      // Handle client-side rendering
      try {
        const [splashContent, template] = await Promise.all([
          getSplashContent(),
          fs.readFile(
            path.resolve(__dirname, '../client/dist/index.html'),
            'utf-8',
          ),
        ])

        const processedTemplate = template
          .replace('<!--ssr-outlet-->', '')
          .replace('<div id="splash-screen">', splashContent)
          .replace(
            '<style>',
            `<link rel="stylesheet" href="/styles/components/css-splash.css"><style>`,
          )

        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store, must-revalidate')
        res.status(200).end(processedTemplate)
      } catch (error) {
        console.error('Error handling client-side rendering:', error)
        next(error)
      }
    }
  } catch (e) {
    console.error('Failed to create SSR middleware:', e)
    throw e
  }
}

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

function handleCSSRequest(req, res, next) {
  const cssPath = path.join(__dirname, '../client/dist', req.path)

  if (!fs.existsSync(cssPath)) {
    console.error('CSS file not found:', cssPath)
    return res.status(404).send('CSS file not found')
  }

  res.setHeader('Content-Type', 'text/css')
  res.setHeader('Cache-Control', 'public, max-age=31536000')

  res.sendFile(cssPath, err => {
    if (err) {
      console.error('Error serving CSS file:', err)
      next(err)
    }
  })
}

function setupStaticHandling(app) {
  const distPath = path.join(__dirname, '../client/dist')

  // Serve static files with specific configurations
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
  }

  app.use(
    '/locales',
    express.static(path.join(distPath, 'locales'), {
      ...staticOptions,
      setHeaders: res => {
        res.setHeader('Cache-Control', 'no-store, must-revalidate')
      },
    }),
  )

  app.use(
    '/styles',
    express.static(path.join(distPath, 'styles'), {
      ...staticOptions,
      setHeaders: res => res.setHeader('Content-Type', 'text/css'),
    }),
  )

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

module.exports = { createSSRMiddleware }
