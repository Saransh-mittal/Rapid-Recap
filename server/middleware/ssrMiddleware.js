// server/middleware/ssr/index.js
const { createViteServer } = require('./ssr/vite.config')
const { setupStaticHandling } = require('./ssr/static.config')
const { setupCSPMiddleware } = require('./ssr/csp.config')
const { setupLocaleMiddleware } = require('./ssr/locale.config')
const { createSSRHandler } = require('./ssr/handler')

async function createSSRMiddleware(app) {
  try {
    console.log('Initializing SSR middleware...')

    // Initialize Vite server
    const vite = await createViteServer()
    console.log('Vite server initialized successfully')

    // Debug middleware
    // app.use((req, res, next) => {
    //   console.log(`[${new Date().toISOString()}] Request received:`, req.url)
    //   next()
    // })

    // Setup various middleware components
    setupStaticHandling(app)
    setupCSPMiddleware(app)
    setupLocaleMiddleware(app)

    // Add Vite middleware
    app.use(vite.middlewares)

    // Return the main SSR handler
    return createSSRHandler(vite)
  } catch (e) {
    console.error('Failed to create SSR middleware:', e)
    throw e
  }
}

module.exports = { createSSRMiddleware }
