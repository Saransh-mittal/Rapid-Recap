const { createServer: createViteServer } = require('vite')
const path = require('path')
const fs = require('fs').promises
const express = require('express')
const crypto = require('crypto')
const createEmotionServer = require('@emotion/server/create-instance').default
const createCache = require('@emotion/cache').default

async function createSSRMiddleware(app) {
  let vite

  try {
    console.log('Initializing SSR middleware...')

    vite = await createViteServer({
      server: {
        middlewareMode: 'html',
        hmr: {
          protocol: 'ws',
          host: 'localhost',
          port: 24678,
        },
        watch: {
          usePolling: true,
          interval: 100,
        },
      },
      appType: 'custom',
      root: path.join(__dirname, '../../client'),
      plugins: [
        {
          name: 'handle-locales',
          transform(code, id) {
            if (id.includes('/locales/') && id.endsWith('.json')) {
              return {
                code: `export default ${code}`,
                map: null,
              }
            }
          },
        },
      ],
      optimizeDeps: {
        include: [
          '@chakra-ui/react',
          '@emotion/react',
          '@emotion/styled',
          'framer-motion',
        ],
      },
      ssr: {
        noExternal: [
          '@chakra-ui/react',
          '@emotion/react',
          '@emotion/styled',
          'framer-motion',
        ],
      },
    })

    console.log('Vite server initialized successfully')

    // Debugging middleware
    app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] Request received:`, req.url)
      next()
    })

    // Static file handling configuration remains the same...
    app.use(
      '/images',
      express.static(path.join(__dirname, '../../client/public/images'), {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp')
          }
        },
        maxAge: '1d',
      }),
    )

    app.use(
      '/assets',
      express.static(path.join(__dirname, '../../client/public/assets'), {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp')
          }
        },
        maxAge: '1d',
      }),
    )

    app.get('*.webp', (req, res, next) => {
      res.type('image/webp')
      next()
    })

    app.use('/locales/:lang/:namespace.json', async (req, res) => {
      const { lang, namespace } = req.params
      const filePath = path.join(
        __dirname,
        `../../client/public/locales/${lang}/${namespace}.json`,
      )
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        res.json(JSON.parse(content))
      } catch (error) {
        console.error(`Error loading locale file: ${filePath}`, error)
        res.status(404).send('Not found')
      }
    })

    app.use(vite.middlewares)

    // Updated CSP Middleware with more permissive style-src
    app.use((req, res, next) => {
      console.log('Generating new nonce for request:', req.url)
      const nonce = crypto.randomBytes(16).toString('base64')
      res.locals.nonce = nonce
      console.log('Generated nonce:', nonce)

      const isDev = process.env.NODE_ENV === 'development'
      console.log('Environment:', isDev ? 'development' : 'production')

      const cspHeader = {
        'default-src': ["'self'", 'https:', 'http:'],
        'script-src': [
          "'self'",
          `'nonce-${nonce}'`,
          "'unsafe-eval'",
          "'unsafe-inline'", // Added for development
          'https://cdnjs.cloudflare.com',
          isDev && 'http://localhost:*',
          isDev && 'ws://localhost:*',
        ].filter(Boolean),
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com',
        ],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'img-src': ["'self'", 'data:', 'https://*', 'blob:'],
        'connect-src': [
          "'self'",
          isDev && 'ws://localhost:*',
          isDev && 'wss://localhost:*',
          'ws:',
          'wss:',
        ].filter(Boolean),
        'worker-src': ["'self'", 'blob:'],
        'frame-src': ["'self'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
      }

      const cspString = Object.entries(cspHeader)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ')

      console.log('Setting CSP header:', cspString)

      res.setHeader('Content-Security-Policy', cspString)
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

      next()
    })

    // Main SSR handler
    return async function (req, res, next) {
      const url = req.originalUrl
      const nonce = res.locals.nonce

      console.log('Processing SSR request:', url)
      console.log('Using nonce:', nonce)
      // Skip SSR for non-root routes and API calls
      if (url !== '/' || url.startsWith('/api/') || url.endsWith('.json')) {
        return next()
      }

      try {
        let template = await fs.readFile(
          path.resolve(__dirname, '../../client/index.html'),
          'utf-8',
        )

        // Create Emotion cache
        const cache = createCache({ key: 'ssr' })
        const { extractCriticalToChunks, constructStyleTagsFromChunks } =
          createEmotionServer(cache)

        // Add nonce to all script tags in the template
        template = template.replace(/<script\b([^>]*)>/gi, (match, attrs) => {
          if (attrs.includes('nonce=')) {
            return match
          }
          return `<script nonce="${nonce}"${attrs}>`
        })

        // Add portal containers
        template = template.replace(
          '<div id="root">',
          `
          <div id="root">
          <div id="chakra-toast-portal"></div>
          <div id="chakra-modal-portal"></div>
          <div id="chakra-portal"></div>
          <div id="portal-root"></div>
          `,
        )

        template = await vite.transformIndexHtml(url, template)

        const initialState = {
          app: {
            isLoading: false,
            overallProgress: 100,
            showLoadingScreen: false,
          },
          auth: {
            isAuthenticated: false,
            user: null,
          },
        }

        const render = (await vite.ssrLoadModule('/src/entry-server.jsx'))
          .render

        const {
          html: appHtml,
          state,
          error,
        } = await render(url, {
          initialProps: {},
          emotionCache: cache,
        })

        // Extract critical CSS
        let emotionChunks = []
        let emotionTags = ''

        try {
          emotionChunks = extractCriticalToChunks(appHtml)
          emotionTags = constructStyleTagsFromChunks(emotionChunks)
        } catch (e) {
          console.warn('Emotion extraction failed:', e)
        }

        // Update HTML template with nonce for all dynamic scripts
        let html = template
          .replace(
            '<div id="root">',
            `<div id="root" data-ssr="${!error ? 'true' : 'false'}">`,
          )
          .replace('<!--ssr-outlet-->', appHtml || '<div></div>')
          .replace(
            '</head>',
            `
              ${emotionTags}
              <script nonce="${nonce}">
                window.__PRELOADED_STATE__ = ${JSON.stringify(
                  state || initialState,
                )};
                window.__EMOTION_CACHE_KEY__ = "ssr";
                window.__SSR_ERROR__ = ${JSON.stringify(error || null)};
                window.__CHAKRA_CONFIG__ = {
                  initialColorMode: 'dark',
                  useSystemColorMode: false,
                };
              </script>
              </head>
            `,
          )

        // Ensure all remaining script tags have nonce
        html = html.replace(/<script\b([^>]*)>/gi, (match, attrs) => {
          if (attrs.includes('nonce=')) {
            return match
          }
          return `<script nonce="${nonce}"${attrs}>`
        })

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
      } catch (e) {
        vite?.ssrFixStacktrace(e)
        console.error('SSR error:', e)

        // Generate fallback HTML with nonce
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Rapid Recap</title>
              <script nonce="${nonce}">
                window.__PRELOADED_STATE__ = ${JSON.stringify({
                  app: {
                    isLoading: false,
                    overallProgress: 100,
                    showLoadingScreen: false,
                  },
                  auth: {
                    isAuthenticated: false,
                    user: null,
                  },
                })};
                window.__CHAKRA_CONFIG__ = {
                  initialColorMode: 'dark',
                  useSystemColorMode: false,
                };
                window.__SSR_ERROR__ = ${JSON.stringify(e.message)};
                window.__CLIENT_ONLY__ = true;
              </script>
            </head>
            <body>
              <div id="root" data-ssr="false"></div>
              <div id="chakra-toast-portal"></div>
              <div id="chakra-modal-portal"></div>
              <div id="chakra-portal"></div>
              <div id="portal-root"></div>
              <script type="module" nonce="${nonce}" src="/src/main.jsx"></script>
            </body>
          </html>
        `.trim()

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
      }
    }
  } catch (e) {
    console.error('Failed to create SSR middleware:', e)
    throw e
  }
}

module.exports = { createSSRMiddleware }
