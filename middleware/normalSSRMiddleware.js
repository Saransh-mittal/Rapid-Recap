// middleware/normalSSRMiddleware.js - PROPER SOLUTION for cold start

const path = require('path')
const fs = require('fs').promises
const cache = require('memory-cache')
const express = require('express')

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
        const isEligibleRoute = !url.includes('article')
        const { isAuthenticated, isReturningUser } = getAuthenticationState(req)

        console.log('SSR Processing:', {
          url,
          isEligibleRoute,
          isAuthenticated,
          isReturningUser,
          authSignalCookie: req.cookies[AUTH_SIGNAL_COOKIE],
          accessTokenCookie: !!req.cookies.access_token,
        })

        // ALWAYS get splash content
        const splashContent = await getSplashContent()
        const template = await fs.readFile(
          path.resolve(__dirname, '../client/dist/index.html'),
          'utf-8',
        )

        // Generate dynamic SEO tags & JSON-LD schemas
        let dynamicHeadTags = '';
        if (url === '/') {
           dynamicHeadTags = `
             <title>Quick Clash – 4v4 Competitive Learning Game | Rapid Recap</title>
             <meta name="description" content="Join Quick Clash for an immersive 4v4 learning game. Experience the Forge Phase and Quiz Phase to master current affairs through high-pressure competitive gameplay.">
             <meta property="og:title" content="Quick Clash – 4v4 Competitive Learning Game | Rapid Recap">
             <meta property="og:description" content="Join Quick Clash for an immersive 4v4 learning game. Experience the Forge Phase and Quiz Phase to master current affairs through high-pressure competitive gameplay.">
             <meta property="og:image" content="https://rapidrecap.ai/og-image.jpg">
             <meta property="og:url" content="https://rapidrecap.ai/">
             <meta property="og:type" content="website">
             <meta name="twitter:card" content="summary_large_image">
             <meta name="twitter:title" content="Quick Clash – 4v4 Competitive Learning Game | Rapid Recap">
             <meta name="twitter:description" content="Join Quick Clash for an immersive 4v4 learning game. Experience the Forge Phase and Quiz Phase to master current affairs through high-pressure competitive gameplay.">
             <meta name="twitter:image" content="https://rapidrecap.ai/og-image.jpg">
             <link rel="canonical" href="https://rapidrecap.ai/">
             <script type="application/ld+json">
             {
               "@context": "https://schema.org",
               "@graph": [
                 {
                   "@type": "WebSite",
                   "@id": "https://rapidrecap.ai/#website",
                   "url": "https://rapidrecap.ai/",
                   "name": "Rapid Recap",
                   "description": "4v4 Competitive Learning Game Platform"
                 },
                 {
                   "@type": "Organization",
                   "@id": "https://rapidrecap.ai/#organization",
                   "name": "Rapid Recap",
                   "url": "https://rapidrecap.ai/",
                   "logo": "https://rapidrecap.ai/og-image.jpg"
                 }
               ]
             }
             </script>
           `;
        } else if (url.startsWith('/manual')) {
           const manualRouteData = {
              '/manual': { title: 'Rulebook & Game Manual – Quick Clash | Rapid Recap', desc: 'The complete guide to playing Quick Clash. Learn about game mechanics, scoring system, the Spark Engine, and how to win in Solo Drills and Team Battles.' },
              '/manual/quick-clash-v2-overview': { title: 'Quick Clash V2 Overview – Game Manual', desc: 'Learn the core Quick Clash experience, the 4v4 format, and two-phase battle mechanics.' },
              '/manual/forge-phase': { title: 'The Forge Phase Mechanics – Quick Clash', desc: 'Master the Forge Phase. Learn about progressive content unlocks and reading timers.' },
              '/manual/quiz-phase': { title: 'The Quiz Phase Strategy – Quick Clash', desc: 'Win the Quiz Phase. Understand the 10-question competitive format and RQM scoring.' },
              '/manual/powerups': { title: 'Powerups & Strategy – Quick Clash', desc: 'Optimize your Quick Clash loadout with Time Warp, Score Surge, Oracle Eye and more.' },
              '/manual/matchmaking-teams': { title: 'Teams & Matchmaking – Quick Clash', desc: 'Learn how the 4v4 Spark Engine matchmaking system auto-forms teams instantly.' },
              '/manual/profile-progression': { title: 'Profile & Trophy Progression – Quick Clash', desc: 'Track your battle history, win rate, and navigate the high-stakes trophy betting system.' },
              '/manual/solo-custom-drills': { title: 'Solo & Custom Drills – Quick Clash', desc: 'Upload your own personalized content in Custom Drills or practice in Standard Solo Drills.' },
           };
           
           // Clean the URL (remove query params for lookup)
           const cleanPath = url.split('?')[0];
           const pageData = manualRouteData[cleanPath] || manualRouteData['/manual'];

           dynamicHeadTags = `
             <title>${pageData.title}</title>
             <meta name="description" content="${pageData.desc}">
             <meta property="og:title" content="${pageData.title}">
             <meta property="og:description" content="${pageData.desc}">
             <meta property="og:image" content="https://rapidrecap.ai/og-image.jpg">
             <meta property="og:url" content="https://rapidrecap.ai${cleanPath}">
             <meta property="og:type" content="article">
             <meta name="twitter:card" content="summary_large_image">
             <meta name="twitter:title" content="${pageData.title}">
             <meta name="twitter:description" content="${pageData.desc}">
             <meta name="twitter:image" content="https://rapidrecap.ai/og-image.jpg">
             <link rel="canonical" href="https://rapidrecap.ai${cleanPath}">
             <script type="application/ld+json">
             {
               "@context": "https://schema.org",
               "@type": "FAQPage",
               "mainEntity": [
                 {
                   "@type": "Question",
                   "name": "What is Quick Clash?",
                   "acceptedAnswer": {
                     "@type": "Answer",
                     "text": "Quick Clash V2 is a fast-paced, 4v4 team-based competitive learning game. Matches take approximately 30 seconds to find. It tests knowledge and reading speed in a high-stakes format."
                   }
                 },
                 {
                   "@type": "Question",
                   "name": "How does RQM scoring work in Quick Clash?",
                   "acceptedAnswer": {
                     "@type": "Answer",
                     "text": "Scores are determined by the Rapid Quiz Mastery (RQM) metric — a balance of accuracy, speed bonus, and a precision bonus. Higher accuracy and faster completion yield maximum RQM."
                   }
                 },
                 {
                   "@type": "Question",
                   "name": "What is the Spark Engine Auto-Formation?",
                   "acceptedAnswer": {
                     "@type": "Answer",
                     "text": "The Spark Engine ensures nobody waits in queues. Solo players and partial teams (1 to 3 players) are instantly integrated into temporary Auto-Formed teams, ensuring 4v4 matches happen immediately."
                   }
                 },
                 {
                   "@type": "Question",
                   "name": "What are Custom Drills (Bring Your Own Content)?",
                   "acceptedAnswer": {
                     "@type": "Answer",
                     "text": "Custom Drills allow users to directly upload up to 2,500 characters of their own personal study material. The AI dynamically generates a fully structured, playable Forge article and Quiz session based strictly on your text."
                   }
                 }
               ]
             }
             </script>
           `;
        }

        // Inject splash screen content
        let processedTemplate = template.replace('<!--ssr-outlet-->', '')
        
        if (dynamicHeadTags) {
           processedTemplate = processedTemplate.replace('</head>', `${dynamicHeadTags}</head>`);
        }

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
