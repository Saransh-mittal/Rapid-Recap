const path = require('path')
const fs = require('fs').promises
const cache = require('memory-cache')
const ArticleService = require('../../services/articleService')
const BotVerifier = require('../../utils/botVerifier')
const { trackBotVisit } = require('../../utils/botTracker')
const { generateAndInjectSchemas } = require('../../utils/structuredData')

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

async function getBotContent(urlType, url) {
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
          path.resolve(
            __dirname,
            '../../client/dist/bot/components/navbar.html',
          ),
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
          path.resolve(
            __dirname,
            '../../client/dist/bot/components/footer.html',
          ),
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
    } else {
      const [navbarContent, articleTemplateContent] = await Promise.all([
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
      ])

      // Get article content
      const articleId = ArticleService.extractArticleId(url)
      const articleData = await ArticleService.getArticleContent(articleId)

      // Replace placeholders in template with actual content
      const articleContent = ArticleService.replaceArticleContent(
        articleTemplateContent,
        articleData,
      )

      content = {
        navbar: navbarContent,
        article: articleContent,
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

// Function to get splash content with caching
async function getSplashContent() {
  try {
    // Check cache first
    const cachedContent = cache.get('splash-content')
    if (cachedContent) {
      return cachedContent
    }

    const content = await fs.readFile(
      path.resolve(__dirname, '../../client/dist/splash.html'),
      'utf-8',
    )
    // Store in cache
    cache.put('splash-content', content, CACHE_DURATION)

    return content
  } catch (error) {
    console.error('Error reading splash content:', error)
    return ''
  }
}

function createSSRHandler(vite) {
  return async function (req, res, next) {
    const startTime = Date.now()

    const url = req.originalUrl
    const nonce = res.locals.nonce
    const userAgent = req.headers['user-agent'] || ''
    // console.log('SSR handler called', url)
    const isBot = await shouldHandleAsBot(req)
    try {
      let botName = null
      let verified = false

      // Cache key for the full page template
      const templateCacheKey = `template-${isBot ? 'bot' : 'user'}-${url}`

      // Check if we have a cached template
      let template = cache.get(templateCacheKey)

      if (!template) {
        // Read and transform template if not cached
        template = await fs.readFile(
          path.resolve(__dirname, '../../client/dist/index.html'),
          'utf-8',
        )

        if (vite) {
          template = await vite.transformIndexHtml(url, template)
        }

        // Handle scripts and bot detection
        template = template
          .replace(/<script\b([^>]*)>/gi, (match, attrs) => {
            if (attrs.includes('nonce=')) return match
            const hasType = attrs.includes('type=')
            const typeAttr = hasType ? '' : ' type="module"'
            return `<script nonce="${nonce}"${typeAttr}${attrs}>`
          })
          .replace(
            'window.__IS_BOT__ = false;',
            `window.__IS_BOT__ = ${isBot};`,
          )
          .replace('<html', `<html data-bot="${isBot}"`)
        if (isBot) {
          botName =
            BotVerifier.knownBots.find(bot =>
              userAgent.toLowerCase().includes(bot.toLowerCase()),
            ) || 'Unknown Bot'
          const urlType =
            url.includes('get-started') || url === '/' || url === '/?bot=true'
              ? 'get-started'
              : 'article'
          const botContent = await getBotContent(urlType, url)
          template = handleBotTemplate(template, botContent, urlType)
          // Inject structured data
          const baseUrl = `${req.protocol}://${req.get('host')}`
          template = generateAndInjectSchemas({
            template,
            articleData:
              urlType === 'article'
                ? await ArticleService.getArticleContent(
                    ArticleService.extractArticleId(url),
                  )
                : null,
            url,
            baseUrl,
          })
        } else {
          template = await handleClientRendering()
        }

        // Store the processed template in cache
        cache.put(templateCacheKey, template, CACHE_DURATION)
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store, must-revalidate')
      if (isBot) {
        const responseTime = Date.now() - startTime
        await trackBotVisit({
          botName,
          userAgent,
          url,
          verified,
          receivedSSR: true,
          responseTime,
        })
      }
      res.status(200).end(template)
    } catch (e) {
      console.error('SSR error:', e)
      if (isBot) {
        const responseTime = Date.now() - startTime
        await trackBotVisit({
          botName,
          userAgent,
          url,
          verified,
          receivedSSR: false,
          responseTime,
        })
      }

      next(e)
    }
  }
}

async function handleClientRendering() {
  // Preserve the root div for client-side React
  let [splashContent, processedTemplate] = await Promise.all([
    getSplashContent(),
    fs.readFile(
      path.resolve(__dirname, '../../client/dist/index.html'),
      'utf-8',
    ),
  ])

  processedTemplate = processedTemplate
    .replace('<!--ssr-outlet-->', '') // Clear SSR outlet
    .replace('<div id="splash-screen">', splashContent) // Show splash screen
    .replace(
      '<style>',
      `<link rel="stylesheet" href="/styles/components/css-splash.css"><style>`,
    )

  return processedTemplate
}

function handleBotTemplate(template, botContent, urlType) {
  let result = template
    .replace('<div id="root">', '<div id="root" style="display: none;">')
    .replace(
      '<div id="splash-screen">',
      '<div id="splash-screen" style="display: none;">',
    )
    .replace('<div id="bot-navbar"></div>', botContent.navbar)

  if (urlType === 'get-started') {
    result = result
      .replace('<div id="bot-hero"></div>', botContent.hero)
      .replace('<div id="bot-benefits"></div>', botContent.benefits)
      .replace('<div id="bot-features"></div>', botContent.features)
      .replace('<div id="bot-footer"></div>', botContent.footer)
  } else {
    result = result.replace('<div id="bot-article"></div>', botContent.article)
  }

  result = result.replace(
    '<style>',
    `<link rel="stylesheet" href="/styles/utils/reset.css">
<link rel="stylesheet" href="/styles/utils/variables.css">
<link rel="stylesheet" href="/styles/main.css">
<link rel="stylesheet" href="/styles/components/css-navigation.css">
<link rel="stylesheet" href="/styles/components/css-article.css">
<link rel="stylesheet" href="/styles/components/css-hero.css">
<link rel="stylesheet" href="/styles/components/css-features.css">
<link rel="stylesheet" href="/styles/components/css-benefits.css">
<link rel="stylesheet" href="/styles/components/css-sections.css">
<link rel="stylesheet" href="/styles/components/css-footer.css">
<link rel="stylesheet" href="/styles/utils/responsive.css">
<style>`,
  )

  return result
}

async function shouldHandleAsBot(req) {
  const botRoutes = ['/', '/article', '/get-started']
  const url = req.originalUrl

  if (!botRoutes.some(route => url.includes(route))) {
    return false
  }

  // Development specific routes for testing
  if (process.env.NODE_ENV === 'development') {
    if (req.query.bot === 'true') {
      return true
    }
  }

  return await BotVerifier.isLegitimateBot(req)
}

module.exports = { createSSRHandler }
