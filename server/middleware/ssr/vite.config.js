// server/middleware/ssr/vite.config.js
const { createServer } = require('vite')
const path = require('path')

async function createViteServer() {
  return await createServer({
    server: {
      middlewareMode: 'ssr',
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 24678,
      },
      watch: {
        usePolling: true,
        interval: 100,
      },
      // Configure CORS
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    appType: 'custom',
    root: path.join(__dirname, '../../../client'),
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
      {
        name: 'configure-server',
        configureServer(server) {
          return () => {
            server.middlewares.use((req, res, next) => {
              // Handle development-specific files
              if (
                req.url.includes('@vite/client') ||
                req.url.includes('@react-refresh')
              ) {
                res.setHeader('Content-Type', 'application/javascript')
                res.setHeader('Access-Control-Allow-Origin', '*')
              }
              next()
            })
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
}

module.exports = { createViteServer }
