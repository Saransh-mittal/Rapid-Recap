const path = require('path')
const fs = require('fs')
const { createServer: createViteServer } = require('vite')
const accept = require('accept-language-parser')
const compression = require('compression')
const crypto = require('crypto')

const isDev = process.env.NODE_ENV !== 'production'
const HMR_PORT = 24678

function generateHash(content) {
  const hash = crypto.createHash('sha256')
  hash.update(content)
  return `'sha256-${hash.digest('base64')}'`
}

const createSSRMiddleware = async app => {
  let vite

  if (isDev) {
    vite = await createViteServer({
      root: path.join(process.cwd(), '../client'),
      server: {
        middlewareMode: true,
        hmr: {
          protocol: 'ws',
          host: 'localhost',
          port: HMR_PORT,
        },
      },
      appType: 'custom',
    })
    app.use(vite.middlewares)
  }

  app.use(compression())

  app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64')
    res.locals.nonce = nonce

    // Define inline scripts that will be used
    const splashScreenScript = `
      window.addEventListener('DOMContentLoaded', function() {
        var splash = document.getElementById('splash-screen');
        if (splash) { splash.style.display = 'none'; }
      });
    `

    const viteClientScript = `
      import RefreshRuntime from "/@react-refresh"
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    `

    // Calculate hashes for inline scripts
    const scriptHashes = [
      generateHash(splashScreenScript.trim()),
      // Add hash for Vite client script in dev mode
      ...(isDev ? [generateHash(viteClientScript.trim())] : []),
      // Known hashes for third-party scripts
      "'sha256-ywyB+1podf2aKzzGdwf4udVnCgrZrL+zk7TbwEUwVzA='",
      "'sha256-xk1PJmqU+C+oqKJc3DrSvUl4BSYFXJQwnqwakrYwE3E='",
    ]

    // Build CSP directives
    const directivesMap = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        `'nonce-${nonce}'`,
        "'unsafe-eval'",
        'https://cdnjs.cloudflare.com',
        ...scriptHashes,
        ...(isDev
          ? [`http://localhost:${HMR_PORT}`, `ws://localhost:${HMR_PORT}`]
          : []),
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
      ],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
      'connect-src': [
        "'self'",
        ...(isDev
          ? [
              'ws:',
              'wss:',
              'http:',
              'https:',
              `ws://localhost:${HMR_PORT}`,
              'http://localhost:*',
            ]
          : ['wss:', 'https:']),
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    }

    const csp = Object.entries(directivesMap)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ')

    res.setHeader('Content-Security-Policy', csp)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

    if (!isDev) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      )
    }

    // Store the script content for later use
    res.locals.scripts = {
      splashScreenScript,
      viteClientScript,
    }

    next()
  })

  return async function ssrMiddleware(req, res, next) {
    const url = req.originalUrl
    const nonce = res.locals.nonce
    const scripts = res.locals.scripts

    if (!['/'].includes(url)) {
      return next()
    }

    try {
      let template, render

      if (isDev) {
        template = fs.readFileSync(
          path.resolve(process.cwd(), '../client/index.html'),
          'utf-8',
        )
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render
      } else {
        template = fs.readFileSync(
          path.resolve(process.cwd(), 'client/dist/client/index.html'),
          'utf-8',
        )
        render = require(path.resolve(
          process.cwd(),
          'client/dist/server/entry-server.js',
        )).render
      }

      const {
        html: appHtml,
        helmetContext,
        preloadedState,
      } = await render(url, {
        language: accept.parse(req.headers['accept-language'])[0]?.code || 'en',
      })

      const { helmet } = helmetContext

      // Add nonced scripts exactly as they were hashed
      const scriptTags = `
        <script nonce="${nonce}">${scripts.splashScreenScript}</script>
        <script nonce="${nonce}">
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(
            /</g,
            '\\u003c',
          )};
        </script>
        ${
          isDev
            ? `
          <script type="module" nonce="${nonce}">${scripts.viteClientScript}</script>
        `
            : ''
        }
      `

      // Inject all content
      const finalHtml = template
        .replace(
          '</head>',
          `${scriptTags}${helmet?.title.toString() || ''}${
            helmet?.meta.toString() || ''
          }</head>`,
        )
        .replace('<!--ssr-outlet-->', appHtml)

      res.setHeader('Cache-Control', isDev ? 'no-cache' : 'public, max-age=300')
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.status(200).end(finalHtml)
    } catch (error) {
      console.error('SSR Error:', error)
      next(error)
    }
  }
}

module.exports = createSSRMiddleware
