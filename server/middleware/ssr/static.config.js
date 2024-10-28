// server/middleware/ssr/static.config.js
const express = require('express')
const path = require('path')

function setupStaticHandling(app) {
  // Configure static file handling for images
  app.use(
    '/images',
    express.static(path.join(__dirname, '../../../client/public/images'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.webp')) {
          res.setHeader('Content-Type', 'image/webp')
        }
      },
      maxAge: '1d',
    }),
  )

  // Configure static file handling for assets
  app.use(
    '/assets',
    express.static(path.join(__dirname, '../../../client/public/assets'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.webp')) {
          res.setHeader('Content-Type', 'image/webp')
        }
      },
      maxAge: '1d',
    }),
  )

  // Handle WebP content type
  app.get('*.webp', (req, res, next) => {
    res.type('image/webp')
    next()
  })
}

module.exports = { setupStaticHandling }
