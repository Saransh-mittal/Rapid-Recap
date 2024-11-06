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

const app = express()
const server = http.createServer(app)
app.set('trust proxy', true)
if (process.env.NODE_ENV === 'development') {
  // Development: Disable security features for easier development
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false,
    }),
  )
  // CORS for development
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
  // Production: Enable security and optimization features
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
          ],
          scriptSrcElem: [
            "'self'",
            "'unsafe-inline'",
            'https://www.googletagmanager.com',
            'https://www.google-analytics.com',
            'https://accounts.google.com',
            'https://apis.google.com',
            'https://*.googleusercontent.com',
          ],
          frameSrc: ["'self'", 'https://accounts.google.com'],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
            'https://*.googleapis.com',
            'https://accounts.google.com',
          ],
          fontSrc: [
            "'self'",
            'https://fonts.gstatic.com',
            'https://*.gstatic.com',
            'data:',
          ],
          imgSrc: [
            "'self'",
            'data:',
            'https:',
            'blob:',
            'https://*.googleusercontent.com',
            'https://*.google.com',
          ],
          connectSrc: [
            "'self'",
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://www.google-analytics.com',
            'https://accounts.google.com',
            'https://*.googleapis.com',
            'ws:',
            'wss:',
          ],
          mediaSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'", 'https://accounts.google.com'],
          manifestSrc: ["'self'"],
          workerSrc: ["'self'", 'blob:'],
        },
      },
      crossOriginOpenerPolicy: {
        policy: 'unsafe-none',
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  )
  app.use(searchConsoleMiddleware)
  // Production compression
  app.use(
    compression({
      level: 6, // Balanced between compression and CPU usage
      threshold: 1024, // Only compress responses bigger than 1KB
      filter: (req, res) => {
        // Don't compress responses with this header
        if (req.headers['x-no-compression']) {
          return false
        }
        // Use compression filter function
        return compression.filter(req, res)
      },
      // Additional options for specific file types
      windowBits: 15,
      memLevel: 8,
      strategy: 0,
    }),
  )
}

// app.use((req, res, next) => {
//   const userAgent = req.headers['user-agent'] || ''
//   if (
//     userAgent.includes('Chrome-Lighthouse') ||
//     userAgent.includes('PageSpeed Insights')
//   ) {
//     console.log('pageSpeed request detected')
//     console.log('PageSpeed Request Details:', {
//       timestamp: new Date().toISOString(),
//       realIP: BotVerifier.getRealIP(req),
//       proxyHeaders: {
//         xForwardedFor: req.headers['x-forwarded-for'],
//         xRealIP: req.headers['x-real-ip'],
//       },
//       userAgent: req.headers['user-agent'],
//     })
//   }
//   next()
// })
app.use(cookieParser())
app.use(i18nMiddleware.handle(i18n))

// Body parser middleware
app.use(bodyParser.json())
const connectDB = require('./db/conn')
const { initializeSocket } = require('./socket')

webpush.setVapidDetails(
  'mailto:rapidrecap2k23@gmail.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY,
)

app.use(express.json())
// Error Handling middlewares
app.use(errorHandler)

// Scheduler
require('./scheduler/setupCronJobs')
initBotTracking()

// Setup routes and SSR
async function initializeServer() {
  try {
    app.use(
      express.static(path.join(__dirname, 'client/dist'), {
        index: false, // Prevent serving index.html directly
      }),
    )
    // Initialize SSR middleware
    const ssrMiddleware = await createSSRMiddleware(app)

    // API Routes - Define before SSR middleware
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

    // SSR Middleware - Handle all non-API routes
    app.use((req, res, next) => {
      // Skip SSR for API routes
      if (req.path.startsWith('/api/')) {
        return next()
      }

      // // Debug logging
      // console.log('Request URL:', req.url)
      // console.log('Request path:', req.path)
      // console.log('Is XHR:', req.xhr)
      // console.log('Accept header:', req.headers.accept)

      return ssrMiddleware(req, res, next)
    })

    // Error handling middleware
    app.use(errorHandler)

    // Start server
    const PORT = process.env.PORT || 3000
    await connectDB()
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to initialize server:', err)
    process.exit(1)
  }
}
initializeSocket(server)
initializeServer()

module.exports = { app, server }
