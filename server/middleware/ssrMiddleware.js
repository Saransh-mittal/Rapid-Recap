// middleware/ssrMiddleware.js
const path = require('path')
const express = require('express')
const fs = require('fs')
const { createSSRHandler } = require('./ssr/handler')
async function createSSRMiddleware(app) {
  try {
    console.log('Initializing SSR middleware...')

    // Setup static file handling first
    setupStaticHandling(app)

    // Create the SSR handler
    const ssrHandler = createSSRHandler(null)

    return async (req, res, next) => {
      const url = req.originalUrl
      console.log('Request URL:', url)

      // Handle CSS files specifically
      if (url.endsWith('.css')) {
        return handleCSSRequest(req, res, next)
      }

      // Skip SSR for other static files
      if (shouldSkipSSR(url)) {
        return next()
      }

      // Handle SSR
      try {
        await ssrHandler(req, res, next)
      } catch (error) {
        console.error('SSR handling error:', error)
        next(error)
      }
    }
  } catch (e) {
    console.error('Failed to create SSR middleware:', e)
    throw e
  }
}

function handleCSSRequest(req, res, next) {
  const cssPath = path.join(__dirname, '../client/dist', req.path)

  // Debug logging
  console.log('Attempting to serve CSS file:', cssPath)

  // Check if file exists
  if (!fs.existsSync(cssPath)) {
    console.error('CSS file not found:', cssPath)
    return res.status(404).send('CSS file not found')
  }

  // Set proper CSS headers
  res.setHeader('Content-Type', 'text/css')
  res.setHeader('Cache-Control', 'public, max-age=31536000')

  // Send the file
  res.sendFile(cssPath, err => {
    if (err) {
      console.error('Error serving CSS file:', err)
      next(err)
    }
  })
}

function setupStaticHandling(app) {
  const distPath = path.join(__dirname, '../client/dist')

  // Middleware to ensure proper MIME types
  app.use((req, res, next) => {
    const ext = path.extname(req.path)

    // Set content type based on file extension
    switch (ext) {
      case '.css':
        res.type('text/css')
        break
      case '.js':
        res.type('application/javascript')
        break
      case '.webp':
        res.type('image/webp')
        break
      case '.png':
        res.type('image/png')
        break
      case '.json':
        res.type('application/json')
        break
    }
    next()
  })

  // Serve static files with specific configurations
  const staticOptions = {
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath)
      if (ext === '.css') {
        res.setHeader('Content-Type', 'text/css')
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000')
    },
    index: false,
    maxAge: '1y',
  }

  // Serve styles directory specifically
  app.use(
    '/styles',
    express.static(path.join(distPath, 'styles'), {
      ...staticOptions,
      setHeaders: res => {
        res.setHeader('Content-Type', 'text/css')
      },
    }),
  )

  // Serve other static directories
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
    url === '/manifest.json'
  )
}

module.exports = { createSSRMiddleware }
