// server/middleware/ssr/static.config.js
const express = require('express')
const path = require('path')

function setupStaticHandling(app) {
  // Serve public directory files
  app.use(express.static(path.join(__dirname, '../../../client/public')))

  // Serve built files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../../client/dist')))
  }

  // Specific routes for different file types
  const staticConfig = {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      // Set proper CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*')

      // Set proper content types
      if (filePath.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp')
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png')
      } else if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json')
      }
    },
  }

  // Configure static routes
  app.use(
    '/images',
    express.static(
      path.join(__dirname, '../../../client/public/images'),
      staticConfig,
    ),
  )
  app.use(
    '/assets',
    express.static(
      path.join(__dirname, '../../../client/public/assets'),
      staticConfig,
    ),
  )
  app.use(
    '/scripts',
    express.static(
      path.join(__dirname, '../../../client/public/scripts'),
      staticConfig,
    ),
  )

  // Serve manifest.json
  app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../client/public/manifest.json'))
  })

  // Fallback route for webp images
  app.use('*.webp', (req, res, next) => {
    const imagePath = path.join(__dirname, '../../../client/public', req.url)
    res.type('image/webp')
    res.sendFile(imagePath, err => {
      if (err) {
        console.error(`Error serving image ${req.url}:`, err)
        res.status(404).send('Image not found')
      }
    })
  })
}

module.exports = { setupStaticHandling }
