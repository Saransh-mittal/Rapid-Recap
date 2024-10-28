// client/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: 'index.html',
        client: 'src/entry-client.jsx',
      },
      output: {
        // Optimize chunks for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@chakra-ui/react',
            '@emotion/react',
            '@emotion/styled',
            'framer-motion',
          ],
          charts: ['recharts'],
          utils: ['moment', 'lodash', 'axios'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
    // Add source maps for better debugging
    sourcemap: true,
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    visualizer({
      filename: 'stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  define: {
    __IS_BOT__: 'window.__IS_BOT__',
  },
})
