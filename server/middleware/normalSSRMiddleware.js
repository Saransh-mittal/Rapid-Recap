// middleware/normalSSRMiddleware.js - PROPER SOLUTION for cold start

const path = require('path')
const fs = require('fs').promises
const cache = require('memory-cache')
const express = require('express')
const { generateDemoQuestion } = require('../controllers/demoQuizController')

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const AUTH_SIGNAL_COOKIE = 'auth_signal'

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

async function getDemoQuizOverlayContent() {
  try {
    const cachedContent = cache.get('demo-quiz-overlay-content')
    if (cachedContent) {
      return cachedContent
    }

    const content = await fs.readFile(
      path.resolve(__dirname, '../client/dist/demo-quiz-overlay.html'),
      'utf-8',
    )
    cache.put('demo-quiz-overlay-content', content, CACHE_DURATION)
    return content
  } catch (error) {
    console.error('Error reading demo quiz overlay content:', error)
    return ''
  }
}

async function getDemoQuestionForInjection() {
  try {
    const cachedQuestion = cache.get('demo-question-injection')
    if (cachedQuestion) {
      return cachedQuestion
    }

    const result = await generateDemoQuestion()
    if (result.success) {
      cache.put('demo-question-injection', result.question, 30 * 60 * 1000)
      return result.question
    }

    return null
  } catch (error) {
    console.error('Error getting demo question for injection:', error)
    return null
  }
}

// UPDATED: Handle cold start problem
function getAuthenticationState(req) {
  const authSignal = req.cookies[AUTH_SIGNAL_COOKIE]
  const accessToken = req.cookies.access_token

  // If we have auth signal cookie, trust it (returning user)
  if (authSignal === 'true') {
    return { isAuthenticated: true, isReturningUser: true }
  }

  // If we have access token but no auth signal, likely returning user
  if (accessToken) {
    return { isAuthenticated: true, isReturningUser: true }
  }

  // No cookies = cold start (could be new user OR returning user)
  return { isAuthenticated: false, isReturningUser: false }
}

function injectDemoQuestionIntoOverlay(overlayContent, demoQuestion) {
  if (!demoQuestion) return overlayContent

  const questionText = demoQuestion.question?.en || demoQuestion.question || ''
  const category =
    demoQuestion.category?.en || demoQuestion.category || 'General Knowledge'
  const explanation =
    demoQuestion.explanation?.en || demoQuestion.explanation || ''

  const options = demoQuestion.options || {}
  const optionA = options.a?.en || options.a || ''
  const optionB = options.b?.en || options.b || ''
  const optionC = options.c?.en || options.c || ''
  const optionD = options.d?.en || options.d || ''

  let processedContent = overlayContent
    .replace(/{{QUESTION_TEXT}}/g, questionText)
    .replace(/{{QUESTION_CATEGORY}}/g, category)
    .replace(/{{TIME_LIMIT}}/g, demoQuestion.timeLimit || 15)
    .replace(/{{EXPLANATION}}/g, explanation)
    .replace(/{{CORRECT_ANSWER}}/g, demoQuestion.correctAnswer || 'a')
    .replace(/{{OPTION_A}}/g, optionA)
    .replace(/{{OPTION_B}}/g, optionB)
    .replace(/{{OPTION_C}}/g, optionC)
    .replace(/{{OPTION_D}}/g, optionD)

  const difficulty = demoQuestion.difficulty || 0.5
  let difficultyClass = 'medium'
  let difficultyText = 'MEDIUM'

  if (difficulty < 0.3) {
    difficultyClass = 'easy'
    difficultyText = 'EASY'
  } else if (difficulty >= 0.6) {
    difficultyClass = 'hard'
    difficultyText = 'HARD'
  }

  processedContent = processedContent
    .replace(/{{DIFFICULTY_CLASS}}/g, difficultyClass)
    .replace(/{{DIFFICULTY_TEXT}}/g, difficultyText)

  return processedContent
}

async function createSSRMiddleware(app) {
  try {
    setupStaticHandling(app)

    return async (req, res, next) => {
      const url = req.originalUrl
      const isPwaLaunch = req.query.source === 'pwa'

      if (shouldSkipService(url)) {
        return next()
      }

      if (url.endsWith('.css')) {
        return handleCSSRequest(req, res, next)
      }

      if (shouldSkipSSR(url)) {
        return next()
      }

      try {
        const isRootRoute = url === '/' || url === ''
        const { isAuthenticated, isReturningUser } = getAuthenticationState(req)

        // UPDATED: New decision logic
        const shouldIncludeDemoQuiz = isRootRoute && !isPwaLaunch
        const shouldShowDemoQuizByDefault =
          shouldIncludeDemoQuiz && (!isAuthenticated || !isReturningUser)

        console.log('SSR Processing:', {
          url,
          isRootRoute,
          isAuthenticated,
          isReturningUser,
          shouldIncludeDemoQuiz,
          shouldShowDemoQuizByDefault,
          authSignalCookie: req.cookies[AUTH_SIGNAL_COOKIE],
          accessTokenCookie: !!req.cookies.access_token,
        })

        // ALWAYS get splash content
        const splashContent = await getSplashContent()
        const template = await fs.readFile(
          path.resolve(__dirname, '../client/dist/index.html'),
          'utf-8',
        )

        // Get demo quiz content if needed
        let demoQuizOverlayContent = ''
        let demoQuestion = null

        if (shouldIncludeDemoQuiz) {
          demoQuizOverlayContent = await getDemoQuizOverlayContent()
          demoQuestion = await getDemoQuestionForInjection()
        }

        // Process demo quiz overlay
        let processedDemoQuizOverlay = ''
        if (shouldIncludeDemoQuiz && demoQuizOverlayContent && demoQuestion) {
          processedDemoQuizOverlay = injectDemoQuestionIntoOverlay(
            demoQuizOverlayContent,
            demoQuestion,
          )
        }

        // Inject splash screen content
        let processedTemplate = template.replace('<!--ssr-outlet-->', '')

        // UPDATED: Always include demo quiz HTML but let client decide visibility
        if (shouldIncludeDemoQuiz && processedDemoQuizOverlay) {
          processedTemplate = processedTemplate.replace(
            '</body>',
            `${processedDemoQuizOverlay}
            <script>
              // Let client-side decide based on localStorage
              window.__INCLUDE_DEMO_QUIZ__ = true;
              window.__SHOW_DEMO_QUIZ_BY_DEFAULT__ = ${shouldShowDemoQuizByDefault};
              window.__DEMO_QUESTION__ = ${JSON.stringify(demoQuestion)};
              window.__AUTH_SIGNAL_COOKIE__ = '${AUTH_SIGNAL_COOKIE}';
            </script>
            </body>`,
          )
        } else {
          processedTemplate = processedTemplate
            .replace(
              '</body>',
              `<script>
              window.__INCLUDE_DEMO_QUIZ__ = false;
              window.__SHOW_DEMO_QUIZ_BY_DEFAULT__ = false;
              window.__AUTH_SIGNAL_COOKIE__ = '${AUTH_SIGNAL_COOKIE}';
            </script>
            </body>`,
            )
            .replace(
              `<div id="splash-screen" aria-label="Loading screen">
    </div>`,
              splashContent,
            )
        }

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
