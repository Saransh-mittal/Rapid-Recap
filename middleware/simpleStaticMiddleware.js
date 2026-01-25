const express = require('express')
const path = require('path')

const simpleStaticMiddleware = (app) => {
  // Path to the client build directory
  // In Docker: /app/client/dist (since we copy client/dist to /app/client/dist)
  // But we are running from /app/server, so we need to go up one level
  const distPath = path.join(__dirname, '../../client/dist')

  console.log('Serving static files from:', distPath)

  // Serve static files
  app.use(express.static(distPath))

  // Handle all other routes by serving index.html (SPA fallback)
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next()
    }

    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) {
        console.error('Error serving index.html:', err)
        next(err)
      }
    })
  })
}

module.exports = simpleStaticMiddleware
