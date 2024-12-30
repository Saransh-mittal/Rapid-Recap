const path = require('path')
const fs = require('fs').promises
const cache = require('memory-cache')
const ArticleService = require('../../services/articleService')
const BotVerifier = require('../../utils/botVerifier')
const { trackBotVisit } = require('../../utils/botTracker')

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
const SPLASH_CACHE_DURATION = 1 * 60 * 1000 // 1 minute

async function getInitialBotContent() {
  try {
    const cachedContent = cache.get('initial-bot-content')
    if (cachedContent) {
      return cachedContent
    }

    // Only load minimal required components
    const [navbarContent, splashContent, footerContent] = await Promise.all([
      fs.readFile(
        path.resolve(__dirname, '../../client/dist/bot/components/navbar.html'),
        'utf-8',
      ),
      fs.readFile(
        path.resolve(__dirname, '../../client/dist/splash.html'),
        'utf-8',
      ),
      fs.readFile(
        path.resolve(__dirname, '../../client/dist/bot/components/footer.html'),
        'utf-8',
      ),
    ])

    const content = {
      navbar: navbarContent,
      splash: splashContent,
      footer: footerContent,
    }

    cache.put('initial-bot-content', content, SPLASH_CACHE_DURATION)
    return content
  } catch (error) {
    console.error('Error reading initial bot content:', error)
    return { navbar: '', splash: '', footer: '' }
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
    const isBot = await shouldHandleAsBot(req)
    let botName = null
    let verified = false
    let statusCode = 200

    try {
      if (!isBot) {
        const template = await handleClientRendering()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store, must-revalidate')
        return res.status(statusCode).end(template)
      }

      // For bots, implement progressive loading
      const templateCacheKey = `template-bot-${url}`
      let template = cache.get(templateCacheKey)

      if (!template) {
        // Get initial template with splash screen
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

        botName =
          BotVerifier.knownBots.find(bot =>
            userAgent.toLowerCase().includes(bot.toLowerCase()),
          ) || 'Unknown Bot'

        const urlType =
          url.includes('get-started') || url === '/' || url === '/?bot=true'
            ? 'get-started'
            : 'article'

        const baseUrl = `${req.protocol}://${req.get('host')}`

        // Get initial content with splash screen
        const initialContent = await getInitialBotContent()
        template = handleInitialBotTemplate(template, initialContent, urlType)

        // Add progressive loading script
        template = addProgressiveLoadingScript(template, {
          urlType,
          url,
          baseUrl,
          nonce,
          articleId:
            urlType === 'article' ? ArticleService.extractArticleId(url) : null,
        })

        cache.put(templateCacheKey, template, CACHE_DURATION)
      }

      // Send initial response
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store, must-revalidate')

      const responseTime = Date.now() - startTime
      await trackBotVisit({
        botName,
        userAgent,
        url,
        verified,
        receivedSSR: true,
        responseTime,
      })

      res.status(statusCode).end(template)
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

function handleInitialBotTemplate(template, initialContent, urlType) {
  // First add necessary CSS based on urlType
  template = addRequiredStyles(template, urlType)

  return template
    .replace('<div id="root">', '<div id="root" style="display: none;">')
    .replace(
      '<div id="splash-screen">',
      '<div id="splash-screen" style="display: none;">',
    )
    .replace('<div id="bot-navbar"></div>', initialContent.navbar)
    .replace('<div id="bot-hero"></div>', '<div id="bot-hero-content"></div>')
    .replace(
      '<div id="bot-benefits"></div>',
      '<div id="bot-benefits-content"></div>',
    )
    .replace(
      '<div id="bot-features"></div>',
      '<div id="bot-features-content"></div>',
    )
    .replace(
      '<div id="bot-article"></div>',
      '<div id="bot-article-content"></div>',
    )
    .replace('<div id="bot-footer"></div>', initialContent.footer)
}

function addRequiredStyles(template, urlType) {
  const commonStyles = `
    <link rel="stylesheet" href="/styles/utils/reset.css">
    <link rel="stylesheet" href="/styles/utils/variables.css">
    <link rel="stylesheet" href="/styles/main.css">
    <link rel="stylesheet" href="/styles/components/css-navigation.css">
    <link rel="stylesheet" href="/styles/utils/responsive.css">
  `

  const articleStyles = `
    <link rel="stylesheet" href="/styles/components/css-article.css">
    <link rel="stylesheet" href="/styles/components/css-related-articles.css">
  `

  const getStartedStyles = `
    <link rel="stylesheet" href="/styles/components/css-hero.css">
    <link rel="stylesheet" href="/styles/components/css-features.css">
    <link rel="stylesheet" href="/styles/components/css-benefits.css">
    <link rel="stylesheet" href="/styles/components/css-sections.css">
  `

  const errorStyles = `
    <link rel="stylesheet" href="/styles/components/css-error.css">
  `

  let styles = commonStyles
  if (urlType === 'article') {
    styles += articleStyles
  } else if (urlType === 'get-started') {
    styles += getStartedStyles
  } else if (urlType === '410') {
    styles += errorStyles
  }

  styles += `<link rel="stylesheet" href="/styles/components/css-footer.css">`

  return template.replace('<style>', `${styles}<style>`)
}

function addProgressiveLoadingScript(
  template,
  { urlType, url, baseUrl, nonce, articleId },
) {
  const loadingScript = `
    <div id="bot-loading" class="text-center p-4">Loading content...</div>
    <script nonce="${nonce}">
      (async function loadFullContent() {
        try {
          const response = await fetch('/api/bot-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              urlType: '${urlType}',
              url: '${url}',
              baseUrl: '${baseUrl}',
              articleId: '${articleId}'
            })
          });

          const { content, metaTags, schemas } = await response.json();

          // Ensure all required styles are loaded
          const ensureStyles = () => {
            const requiredStyles = ${JSON.stringify(
              getRequiredStylesForUrlType(urlType),
            )};
            requiredStyles.forEach(style => {
              if (!document.querySelector(\`link[href="\${style}"]\`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = style;
                document.head.appendChild(link);
              }
            });
          };

          ensureStyles();

          // Update content based on urlType
          if ('${urlType}' === 'get-started') {
            const contentParts = content.split('<!-- Benefits Section -->');
            if (contentParts.length > 1) {
              const heroPart = contentParts[0];
              const remainingParts = contentParts[1].split('<!-- Features Section -->');

              document.getElementById('bot-hero-content').innerHTML = heroPart;
              document.getElementById('bot-benefits-content').innerHTML = remainingParts[0];
              document.getElementById('bot-features-content').innerHTML = remainingParts[1] || '';
            } else {
              document.getElementById('bot-hero-content').innerHTML = content;
            }
          } else {
            document.getElementById('bot-article-content').innerHTML = content;
          }

          document.getElementById('bot-loading').style.display = 'none';

          // Update meta tags if provided
          if (metaTags) {
            const existingMetas = document.head.querySelectorAll('meta:not([charset]):not([name="viewport"])');
            existingMetas.forEach(meta => meta.remove());

            const metaContainer = document.createElement('div');
            metaContainer.innerHTML = metaTags;
            Array.from(metaContainer.children).forEach(meta => document.head.appendChild(meta));
          }

          // Update schema if provided
          if (schemas) {
            const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]');
            existingSchemas.forEach(schema => schema.remove());

            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(schemas);
            document.head.appendChild(script);
          }

          // Load related articles for article pages
          if ('${urlType}' === 'article' && '${articleId}') {
            const relatedResponse = await fetch('/api/articles/bot-related/${articleId}');
            const relatedHTML = await relatedResponse.text();
            const placeholder = document.getElementById('related-articles-placeholder');
            if (placeholder) {
              placeholder.innerHTML = relatedHTML;
            }
          }
        } catch (error) {
          console.error('Error loading full content:', error);
          document.getElementById('bot-loading').innerHTML = 'Error loading content. Please refresh the page.';
        }
      })();
    </script>
  </body>`

  return template.replace('</body>', loadingScript)
}

function getRequiredStylesForUrlType(urlType) {
  const commonStyles = [
    '/styles/utils/reset.css',
    '/styles/utils/variables.css',
    '/styles/main.css',
    '/styles/components/css-navigation.css',
    '/styles/utils/responsive.css',
    '/styles/components/css-footer.css',
  ]

  const articleStyles = [
    '/styles/components/css-article.css',
    '/styles/components/css-related-articles.css',
  ]

  const getStartedStyles = [
    '/styles/components/css-hero.css',
    '/styles/components/css-features.css',
    '/styles/components/css-benefits.css',
    '/styles/components/css-sections.css',
  ]

  const errorStyles = ['/styles/components/css-error.css']

  if (urlType === 'article') {
    return [...commonStyles, ...articleStyles]
  } else if (urlType === 'get-started') {
    return [...commonStyles, ...getStartedStyles]
  } else if (urlType === '410') {
    return [...commonStyles, ...errorStyles]
  }

  return commonStyles
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

async function shouldHandleAsBot(req) {
  const botRoutes = ['/article', '/get-started']
  const url = req.originalUrl

  if (
    !botRoutes.some(route => url.includes(route)) &&
    url !== '/' &&
    url !== '/?bot=true'
  ) {
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
