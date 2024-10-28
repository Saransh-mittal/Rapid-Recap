// server/middleware/ssr/handler.js
const path = require('path')
const fs = require('fs').promises

function isBotChecker(userAgent) {
  const knownBots = [
    'Googlebot',
    'Bingbot',
    'Slurp', // Yahoo
    'DuckDuckBot',
    'Baiduspider',
    'YandexBot',
    'facebookexternalhit',
    'LinkedInBot',
    'Twitterbot',
  ]

  // Check for known bots
  const isKnownBot = knownBots.some(bot =>
    userAgent.toLowerCase().includes(bot.toLowerCase()),
  )

  // Additional checks for generic bot signatures
  const isGenericBot =
    /bot|crawler|spider|crawling/i.test(userAgent) &&
    !/chrome|firefox|safari|opera|edge/i.test(userAgent)

  return isKnownBot || isGenericBot
}
// server/middleware/ssr/handler.js
function createSSRHandler(vite) {
  return async function (req, res, next) {
    const url = req.originalUrl
    const nonce = res.locals.nonce

    // Skip SSR for non-root routes and API calls
    if (url !== '/' || url.startsWith('/api/') || url.endsWith('.json')) {
      return next()
    }

    try {
      const userAgent = req.headers['user-agent'] || ''
      const isBot = isBotChecker(userAgent)

      // Read template
      let template = await fs.readFile(
        path.resolve(__dirname, '../../../client/index.html'),
        'utf-8',
      )

      if (vite) {
        template = await vite.transformIndexHtml(url, template)
      }

      // For bots, show static content and hide app root
      if (isBot) {
        template = template
          .replace('<div id="root">', '<div id="root" style="display: none;">')
          .replace(
            '<div class="bot-content">',
            '<div class="bot-content" style="display: block;">',
          )
      } else {
        // For users, hide static content
        template = template.replace(
          '<div class="bot-content">',
          '<div class="bot-content" style="display: none;">',
        )
      }

      // Common replacements
      template = template
        .replace(/<script\b([^>]*)>/gi, (match, attrs) =>
          attrs.includes('nonce=')
            ? match
            : `<script nonce="${nonce}"${attrs}>`,
        )
        .replace('window.__IS_BOT__ = false;', `window.__IS_BOT__ = ${isBot};`)
        .replace('<html', `<html data-bot="${isBot}"`)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
    } catch (e) {
      console.error('SSR error:', e)
      next(e)
    }
  }
}

module.exports = { createSSRHandler }
