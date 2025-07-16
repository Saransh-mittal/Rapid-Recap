// vite.config.js - Replace your current config with this optimized version
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react({
      // Use SWC for faster compilation
      jsxImportSource: '@emotion/react',
      plugins: [['@swc/plugin-emotion', {}]],
    }),
  ],

  // Optimize dependency pre-bundling for your specific dependencies
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
      // Add other heavy dependencies from your package.json
      'chart.js',
      'react-chartjs-2',
      'socket.io-client',
      'moment',
    ],
    exclude: ['@vite/client'],
  },

  build: {
    // Use modern JS for faster parsing
    target: 'esnext',

    // Don't split CSS for critical path optimization
    cssCodeSplit: false,

    // Optimize chunks for your app structure
    rollupOptions: {
      output: {
        // Manual chunking optimized for your dependencies
        manualChunks: {
          // Core React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Chakra UI and styling
          'ui-vendor': [
            '@chakra-ui/react',
            '@emotion/react',
            '@emotion/styled',
            'framer-motion',
          ],

          // Redux ecosystem
          'redux-vendor': ['react-redux', '@reduxjs/toolkit'],

          // Charts and visualization
          'charts-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],

          // Internationalization
          'i18n-vendor': [
            'react-i18next',
            'i18next',
            'i18next-browser-languagedetector',
          ],

          // Utilities and smaller libraries
          'utils-vendor': [
            'axios',
            'moment',
            'moment-timezone',
            'lodash.debounce',
            'lodash.throttle',
            'js-cookie',
          ],

          // Socket and real-time features
          'socket-vendor': ['socket.io-client'],
        },

        // Optimize asset naming for better caching
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

    // Enable advanced minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'], // Remove specific functions
      },
      mangle: {
        safari10: true, // Fix Safari 10+ bugs
      },
    },

    // Disable source maps for production (faster builds)
    sourcemap: false,

    // Optimize chunk size
    chunkSizeWarningLimit: 1000,

    // Enable modern build optimizations
    reportCompressedSize: false, // Faster builds
  },

  server: {
    host: true,
    // Optimize HMR for faster development
    hmr: {
      overlay: false, // Disable error overlay for faster development
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  // CSS optimization
  css: {
    devSourcemap: false, // Disable CSS source maps in dev for speed
  },

  // Enable experimental features for better performance
  esbuild: {
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
