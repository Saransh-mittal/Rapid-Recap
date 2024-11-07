const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const { createSSRMiddleware } = require('./middleware/ssrMiddleware')
dotenv.config({ path: './config.env' })
const express = require('express')
const userRoutes = require('./router/userRoutes')
const articleRoutes = require('./router/articleRoutes')
const quizRoutes = require('./router/quizRoutes')
const subscriptionRoutes = require('./router/subscriptionRoutes')
const mailRoutes = require('./router/mailRoutes')
const timeSpentRoutes = require('./router/timeSpentRoutes')
const feedbackRoutes = require('./router/feedbackRoutes')
const notificationRoutes = require('./router/notificationRoutes')
const adminRoutes = require('./router/adminRoutes')
const recommendationRoutes = require('./router/recommendationRoutes')
const chatsRoutes = require('./router/chatsRoutes')
const messageRoutes = require('./router/messageRoutes')
const friendsRoutes = require('./router/friendsRoutes')
const tournamentRoutes = require('./router/tournamentRoutes')
const { errorHandler } = require('./middleware/errorMiddleware')
const webpush = require('web-push')
const cookieParser = require('cookie-parser')
const path = require('path')
const http = require('http')
const compression = require('compression')
const helmet = require('helmet')
const { initBotTracking } = require('./utils/botTracker')
const searchConsoleMiddleware = require('./middleware/searchConsoleMiddleware')
const i18nMiddleware = require('i18next-http-middleware')
const i18n = require('./i18n')
const connectDB = require('./db/conn')

const app = express()
const server = http.createServer(app)

// Trust Railway's proxy
app.set('trust proxy', true)

// Basic middleware setup
app.use(cookieParser())
app.use(i18nMiddleware.handle(i18n))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))
app.use(express.json())

if (process.env.NODE_ENV === 'development') {
  // Development config
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false,
    }),
  )
  // Development CORS
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    )
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200)
    }
    next()
  })
} else {
  // Production configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://www.googletagmanager.com',
            'https://www.google-analytics.com',
            'https://accounts.google.com',
            'https://apis.google.com',
            'https://*.googleusercontent.com',
            'https://storage.googleapis.com',
            `https://${process.env.RAILWAY_PUBLIC_DOMAIN || ''}`.trim(),
          ].filter(Boolean),
          scriptSrcElem: [
            "'self'",
            "'unsafe-inline'",
            'https://www.googletagmanager.com',
            'https://www.google-analytics.com',
            'https://accounts.google.com',
            'https://apis.google.com',
            'https://*.googleusercontent.com',
            'https://storage.googleapis.com',
          ],
          frameSrc: [
            "'self'",
            'https://accounts.google.com',
            'https://www.google.com',
            'https://rapidrecap.co.in',
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
            'https://*.googleapis.com',
            'https://accounts.google.com',
            'https://rapidrecap.co.in',
          ],
          fontSrc: [
            "'self'",
            'https://fonts.gstatic.com',
            'https://*.gstatic.com',
            'data:',
            'https://rapidrecap.co.in',
          ],
          imgSrc: ["'self'", 'data:', 'blob:', '*', 'https:', 'http:'],
          connectSrc: [
            "'self'",
            'https://*',
            'wss://*',
            'ws://*',
            'http://*',
            `https://${process.env.RAILWAY_PUBLIC_DOMAIN || ''}`.trim(),
            `https://${process.env.RAILWAY_PRIVATE_DOMAIN || ''}`.trim(),
            'https://rapidrecap.co.in',
          ].filter(Boolean),
          mediaSrc: ["'self'", '*', 'data:', 'blob:', 'https:', 'http:'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: [
            "'self'",
            'https://accounts.google.com',
            'https://rapidrecap.co.in',
          ],
          manifestSrc: ["'self'"],
          workerSrc: ["'self'", 'blob:', 'data:', 'https://rapidrecap.co.in'],
          frameAncestors: ["'self'", 'https://rapidrecap.co.in'],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginOpenerPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  )

  app.use(searchConsoleMiddleware)

  // Production compression
  app.use(
    compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false
        }
        return compression.filter(req, res)
      },
      windowBits: 15,
      memLevel: 8,
      strategy: 0,
    }),
  )
}

// Enhanced headers for service workers, images, and media
app.use((req, res, next) => {
  // Service worker headers
  if (req.url.includes('service-worker.js') || req.url.includes('sw.js')) {
    res.setHeader('Service-Worker-Allowed', '/')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }

  // Media and image headers
  if (
    req.url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|mp4|webm|ogg|mp3|wav)$/i)
  ) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Range')
  }

  // Push notification headers in production
  if (
    process.env.NODE_ENV === 'production' &&
    (req.url.includes('/api/notify') || req.url.includes('/api/push'))
  ) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }

  next()
})

// Setup web push
webpush.setVapidDetails(
  'mailto:rapidrecap2k23@gmail.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY,
)

// Initialize bot tracking
initBotTracking()

// Load scheduler
require('./scheduler/setupCronJobs')

// Setup routes and SSR
async function initializeServer() {
  try {
    // Static files setup
    app.use(
      express.static(path.join(__dirname, 'client/dist'), {
        index: false,
        maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
        etag: true,
        lastModified: true,
      }),
    )

    // Initialize SSR middleware
    const ssrMiddleware = await createSSRMiddleware(app)

    // API Routes
    const apiRouter = express.Router()
    apiRouter.use('/user', userRoutes)
    apiRouter.use('/articles', articleRoutes)
    apiRouter.use('/quiz', quizRoutes)
    apiRouter.use('/subs', subscriptionRoutes)
    apiRouter.use('/mail', mailRoutes)
    apiRouter.use('/timeSpent', timeSpentRoutes)
    apiRouter.use('/contact/feedback', feedbackRoutes)
    apiRouter.use('/notify', notificationRoutes)
    apiRouter.use('/admin', adminRoutes)
    apiRouter.use('/recommendation', recommendationRoutes)
    apiRouter.use('/chat', chatsRoutes)
    apiRouter.use('/message', messageRoutes)
    apiRouter.use('/friends', friendsRoutes)
    apiRouter.use('/tournament', tournamentRoutes)
    app.use('/api', apiRouter)

    // SSR Middleware for non-API routes
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next()
      }
      return ssrMiddleware(req, res, next)
    })

    // Error handling middleware
    app.use(errorHandler)

    // Connect to database and start server
    const PORT = process.env.PORT || 3000
    await connectDB()

    // Initialize WebSocket
    const { initializeSocket } = require('./socket')
    initializeSocket(server)

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on Railway:`)
      console.log(
        `- Environment: ${
          process.env.RAILWAY_ENVIRONMENT_NAME || 'development'
        }`,
      )
      console.log(`- Service: ${process.env.RAILWAY_SERVICE_NAME || 'local'}`)
      console.log(
        `- Public Domain: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost'}`,
      )
      console.log(`- Port: ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to initialize server:', err)
    process.exit(1)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err)
  process.exit(1)
})

// Initialize the server
initializeServer()

module.exports = { app, server }
