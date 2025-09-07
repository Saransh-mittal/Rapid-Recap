// vite.config.js - Updated with Tailwind v4 Configuration
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Rest of your existing config...
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'react-redux',
      '@reduxjs/toolkit',
      'react-i18next',
      'i18next',
      'framer-motion',
      'axios',
      'chart.js',
      'react-chartjs-2',
      'socket.io-client',
      'moment',
    ],
    exclude: ['@vite/client'],
  },

  build: {
    target: 'esnext',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@chakra-ui/react',
            '@emotion/react',
            '@emotion/styled',
            'framer-motion',
          ],
          'redux-vendor': ['react-redux', '@reduxjs/toolkit'],
          'charts-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
          'i18n-vendor': [
            'react-i18next',
            'i18next',
            'i18next-browser-languagedetector',
          ],
          'utils-vendor': [
            'axios',
            'moment',
            'moment-timezone',
            'lodash.debounce',
            'lodash.throttle',
            'js-cookie',
          ],
          'socket-vendor': ['socket.io-client'],
        },
        assetFileNames: assetInfo => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]

          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name].[hash][extname]`
          }

          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name].[hash][extname]`
          }

          return `assets/[name].[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'],
      },
      mangle: {
        safari10: true,
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
  },

  server: {
    host: true,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  css: {
    devSourcemap: false,
  },

  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
