// server/middleware/ssr/vite.config.js
const { createServer } = require('vite')
const path = require('path')

async function createViteServer() {
  return await createServer({
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
