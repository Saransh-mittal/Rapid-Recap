const path = require('path')
const fs = require('fs').promises
const cache = require('memory-cache')
const ArticleService = require('../../services/articleService')

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

async function getBotContent(urlType, url) {
  try {
    // Check cache first
    const cachedContent = cache.get(`bot-content-${urlType}`)
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
            '../../../client/public/bot/components/navbar.html',
          ),
          'utf-8',
        ),
        fs.readFile(
          path.resolve(
            __dirname,
            '../../../client/public/bot/components/get-started/hero.html',
          ),
          'utf-8',
        ),
        fs.readFile(
          path.resolve(
            __dirname,
            '../../../client/public/bot/components/get-started/benefits.html',
          ),
          'utf-8',
        ),
        fs.readFile(
          path.resolve(
            __dirname,
            '../../../client/public/bot/components/get-started/features.html',
          ),
          'utf-8',
        ),
        fs.readFile(
          path.resolve(
            __dirname,
            '../../../client/public/bot/components/footer.html',
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
            '../../../client/public/bot/components/navbar.html',
          ),
          'utf-8',
        ),
        fs.readFile(
          path.resolve(
            __dirname,
            '../../../client/public/bot/components/article/article.html',
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
      path.resolve(__dirname, '../../../client/public/splash.html'),
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
    const url = req.originalUrl
    const nonce = res.locals.nonce

    if (url.startsWith('/api/') || url.endsWith('.json')) {
      return next()
    }

    try {
      const userAgent = req.headers['user-agent'] || ''
      const isBot =
        req.query.bot === 'true' || shouldHandleAsBot(url, userAgent)

      // Cache key for the full page template
      const templateCacheKey = `template-${isBot ? 'bot' : 'user'}-${url}`

      // Check if we have a cached template
      let template = cache.get(templateCacheKey)
      if (!template) {
        // Read and transform template if not cached
        template = await fs.readFile(
          path.resolve(__dirname, '../../../client/index.html'),
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
          const urlType =
            url.includes('get-started') || url === '/' || url === '/?bot=true'
              ? 'get-started'
              : 'article'
          const botContent = await getBotContent(urlType, url)
          template = handleBotTemplate(template, botContent, urlType)
        } else {
          const splashContent = await getSplashContent()
          template = handleUserTemplate(template, splashContent)
        }

        // Store the processed template in cache
        cache.put(templateCacheKey, template, CACHE_DURATION)
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store, must-revalidate')
      res.status(200).end(template)
    } catch (e) {
      console.error('SSR error:', e)
      next(e)
    }
  }
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

function handleUserTemplate(template, splashContent) {
  return template
    .replace(
      '<div id="splash-screen">',
      `<div id="splash-screen">${splashContent}`,
    )
    .replace(
      '<div id="bot-navbar"></div>',
      '<div id="bot-navbar" style="display: none;">',
    )
    .replace(
      '<div id="bot-hero"></div>',
      '<div id="bot-hero" style="display: none;">',
    )
    .replace(
      '<div id="bot-benefits"></div>',
      '<div id="bot-benefits" style="display: none;">',
    )
    .replace(
      '<div id="bot-features"></div>',
      '<div id="bot-features" style="display: none;">',
    )
    .replace(
      '<div id="bot-footer"></div>',
      '<div id="bot-footer" style="display: none;">',
    )
}

function shouldHandleAsBot(url, userAgent) {
  const botRoutes = ['/', '/home', '/article', '/get-started']
  if (!botRoutes.some(route => url.includes(route))) return false

  const knownBots = [
    'Googlebot',
    'Bingbot',
    'Slurp',
    'DuckDuckBot',
    'Baiduspider',
    'YandexBot',
    'facebookexternalhit',
    'LinkedInBot',
    'Twitterbot',
  ]

  return (
    knownBots.some(bot =>
      userAgent.toLowerCase().includes(bot.toLowerCase()),
    ) ||
    (/bot|crawler|spider|crawling/i.test(userAgent) &&
      !/chrome|firefox|safari|opera|edge/i.test(userAgent))
  )
}

module.exports = { createSSRHandler }
