// server/middleware/ssr/handler.js
const path = require('path')
const fs = require('fs').promises

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

      // Read and transform template
      let template = await fs.readFile(
        path.resolve(__dirname, '../../../client/index.html'),
        'utf-8',
      )

      // Transform with Vite and handle scripts
      if (vite) {
        template = await vite.transformIndexHtml(url, template)
      }

      // Ensure proper script handling
      template = template
        .replace(/<script\b([^>]*)>/gi, (match, attrs) => {
          // Don't duplicate nonce if it exists
          if (attrs.includes('nonce=')) return match

          // Add type="module" for ES modules
          const hasType = attrs.includes('type=')
          const typeAttr = hasType ? '' : ' type="module"'

          return `<script nonce="${nonce}"${typeAttr}${attrs}>`
        })
        .replace('window.__IS_BOT__ = false;', `window.__IS_BOT__ = ${isBot};`)
        .replace('<html', `<html data-bot="${isBot}"`)

      // Bot-specific modifications
      if (isBot) {
        template = handleBotTemplate(template)
      } else {
        template = handleUserTemplate(template)
      }

      // Set proper headers
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store, must-revalidate')
      res.status(200).end(template)
    } catch (e) {
      console.error('SSR error:', e)
      next(e)
    }
  }
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

function handleBotTemplate(template) {
  return template
    .replace('<div id="root">', '<div id="root" style="display: none;">')
    .replace(
      '<div class="bot-content">',
      '<div class="bot-content" style="display: block;">',
    )
}

function handleUserTemplate(template) {
  return template.replace(
    '<div class="bot-content">',
    '<div class="bot-content" style="display: none;">',
  )
}

module.exports = { createSSRHandler }
