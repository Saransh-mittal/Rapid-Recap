const path = require('path')
const express = require('express')
const fs = require('fs').promises
const { createSSRHandler } = require('./ssr/handler')
const { generateMetaAndSchema } = require('../utils/landingPageSeo')
const { generateAndInjectSchemas } = require('../utils/structuredData')
const cache = require('memory-cache')
const ArticleService = require('../services/articleService')
const { generateMetaTags } = require('../utils/seoHelper')

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
async function getBotContent(urlType, url, baseUrl) {
  try {
    // Check cache first
    const cachedContent = cache.get(`bot-content-${url}`)
    if (cachedContent) {
      return cachedContent
    }

    let content = {}

    if (urlType === 'get-started') {
      const [
        navbarContent,
        heroContent,
        benefitsContent,
        featuresContent,
        footerContent,
      ] = await Promise.all([
        fs.readFile(
          path.resolve(__dirname, '../../client/dist/bot/components/navbar.html'),
          'utf-8',
        ),
        fs.readFile(
          path.resolve(
            __dirname,
            '../../client/dist/bot/components/get-started/hero.html',
          ),
          'utf-8',
        ),
        fs.readFile(
          path.resolve(
            __dirname,
            '../../client/dist/bot/components/get-started/benefits.html',
          ),
          'utf-8',
        ),
        fs.readFile(
          path.resolve(
            __dirname,
            '../../client/dist/bot/components/get-started/features.html',
          ),
          'utf-8',
        ),
        fs.readFile(
          path.resolve(__dirname, '../../client/dist/bot/components/footer.html'),
          'utf-8',
        ),
      ])

      content = {
        navbar: navbarContent,
        hero: heroContent,
        benefits: benefitsContent,
        features: featuresContent,
        footer: footerContent,
      }
    } else if (urlType === '410') {
      const [navbarContent, errorContent, footerContent] = await Promise.all([
        fs.readFile(
          path.resolve(__dirname, '../../client/dist/bot/components/navbar.html'),
          'utf-8',
        ),
        fs.readFile(
          path.resolve(
            __dirname,
            '../../client/dist/bot/components/error/410.html',
          ),
          'utf-8',
        ),
        fs.readFile(
          path.resolve(__dirname, '../../client/dist/bot/components/footer.html'),
          'utf-8',
        ),
      ])

      content = {
        navbar: navbarContent,
        error: errorContent,
        footer: footerContent,
        statusCode: 410,
      }
    } else {
      const [navbarContent, articleTemplateContent, footerContent] =
        await Promise.all([
          fs.readFile(
            path.resolve(
              __dirname,
              '../../client/dist/bot/components/navbar.html',
            ),
            'utf-8',
          ),
          fs.readFile(
            path.resolve(
              __dirname,
              '../../client/dist/bot/components/article/article.html',
            ),
            'utf-8',
          ),
          fs.readFile(
            path.resolve(
              __dirname,
              '../../client/dist/bot/components/footer.html',
            ),
            'utf-8',
          ),
        ])

      // Get article content
      const articleId = ArticleService.extractArticleId(url)
      let articleData
      try {
        articleData = await ArticleService.getArticleContent(articleId)
      } catch (error) {
        console.log('Error occured on the url:', url)
        return getBotContent('410', url, baseUrl)
      }

      // Replace placeholders in template with actual content
      const articleContent = ArticleService.replaceArticleContent(
        articleTemplateContent,
        articleData,
      )

      content = {
        navbar: navbarContent,
        article: articleContent,
        footer: footerContent,
        seoMetaTags: generateMetaTags(articleData, baseUrl, url),
        articleData,
      }
    }

    // Store in cache
    cache.put(`bot-content-${urlType}`, content, CACHE_DURATION)
    return content
  } catch (error) {
    console.error('Error reading bot content:', error)
    return {
      navbar: '',
      hero: '',
      benefits: '',
      features: '',
      footer: '',
      article: '',
    }
  }
}

async function createSSRMiddleware(app) {
  try {
    app.post('/api/bot-content', async (req, res) => {
      try {
        const { urlType, url, baseUrl, articleId } = req.body

        const botContent = await getBotContent(urlType, url, baseUrl)

        let response = {
          content: '',
          metaTags: null,
          schemas: null,
        }

        if (urlType === 'get-started') {
          // Add section comments for content splitting
          response.content = `
            <!-- Hero Section -->
            ${botContent.hero || ''}
            <!-- Benefits Section -->
            ${botContent.benefits || ''}
            <!-- Features Section -->
            ${botContent.features || ''}
          `
          const { metaTags, schema } = generateMetaAndSchema(baseUrl)
          response.metaTags = metaTags
          response.schemas = schema
        } else if (urlType === 'article' && articleId) {
          response.content = botContent.article || ''
          response.metaTags = botContent.seoMetaTags
          if (botContent.articleData) {
            // Don't pass template here, just generate the schema
            response.schemas = generateAndInjectSchemas({
              articleData: botContent.articleData,
              url,
              baseUrl,
              templateless: true, // Add a flag to indicate we don't want template manipulation
            }).schemas // Only take the schemas part
          }
        }

        res.json(response)
      } catch (error) {
        console.error('Error serving bot content:', error)
        res.status(500).json({ error: 'Error loading content' })
      }
    })
    // Setup static file handling first
    setupStaticHandling(app)

    // Create the SSR handler
    const ssrHandler = createSSRHandler(null)

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

function shouldSkipService(url) {
  return isOAuthPath(url) || isPushPath(url)
}

function isOAuthPath(url) {
  const oauthPaths = [
    '/auth/google',
    '/api/user/google/callback',
    '/oauth2/callback',
    '/signin/oauth',
    '/api/auth/google',
    '/callback',
    '/oauth2/v2/auth',
    '/oauth2/v1/certs',
    '/gsi/client',
  ]
  return (
    oauthPaths.some(path => url.includes(path)) ||
    url.includes('oauth') ||
    url.includes('gsi') ||
    url.includes('accounts.google.com')
  )
}

function isPushPath(url) {
  const pushPaths = [
    '/api/push',
    '/api/notifications',
    '/api/notify',
    '/service-worker.js',
    '/sw.js',
    '/firebase-messaging-sw.js',
    '/push-manifest.json',
  ]

  return (
    pushPaths.some(path => url.includes(path)) ||
    url.includes('/push') ||
    url.includes('/subscribe') ||
    url.includes('/notifications') ||
    url.endsWith('.js.map') ||
    url.endsWith('-sw.js')
  )
}

function handleCSSRequest(req, res, next) {
  const cssPath = path.join(__dirname, '../../client/dist', req.path)

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
  const distPath = path.join(__dirname, '../../client/dist')

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

      // Special handling for locale files
      if (filePath.includes('/locales/')) {
        res.setHeader('Cache-Control', 'no-store, must-revalidate')
        res.setHeader('Pragma', 'no-cache')
        res.setHeader('Expires', '0')
        return
      }

      if (ext === '.css') {
        res.setHeader('Content-Type', 'text/css')
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

  // Add specific handler for locales before other static routes
  app.use(
    '/locales',
    express.static(path.join(distPath, 'locales'), {
      ...staticOptions,
      setHeaders: res => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store, must-revalidate')
        res.setHeader('Pragma', 'no-cache')
        res.setHeader('Expires', '0')
      },
    }),
  )
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
    express.static(path.join(distPath, 'images'), {
      ...staticOptions,
      setHeaders: res => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store, must-revalidate')
        res.setHeader('Pragma', 'no-cache')
        res.setHeader('Expires', '0')
      },
    }),
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
