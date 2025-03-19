import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'
import { splitVendorChunkPlugin } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production', // Remove console in production
        drop_debugger: true,
        passes: 2, // Multiple passes for better minification
      },
      mangle: {
        safari10: true, // Safari 10 compatibility
      },
      format: {
        comments: false, // Remove comments
      },
    },
    rollupOptions: {
      output: {
        // Optimize chunk sizes by grouping dependencies
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['react-redux', 'redux', '@reduxjs/toolkit'],
          'vendor-ui': [
            '@chakra-ui/react',
            '@chakra-ui/system',
            '@chakra-ui/icons',
            '@chakra-ui/avatar',
            '@chakra-ui/layout',
            '@chakra-ui/modal',
            '@chakra-ui/spinner',
            '@chakra-ui/toast',
            '@emotion/react',
            '@emotion/styled',
            'framer-motion',
            'lucide-react',
          ],
          'vendor-i18n': [
            'i18next',
            'react-i18next',
            'i18next-browser-languagedetector',
            'i18next-http-backend',
          ],
          'vendor-charts': ['chart.js', 'recharts', 'chartjs-adapter-date-fns'],
          'vendor-utils': [
            'lodash.debounce',
            'lodash.throttle',
            'moment',
            'axios',
            'js-cookie',
            'uuid',
            'date-fns',
          ],
          'vendor-plugins': [
            'react-ga4',
            'socket.io-client',
            'emoji-picker-react',
            'react-markdown',
            'react-helmet-async',
          ],
        },
        // Generate smaller chunks
        chunkSizeWarningLimit: 600,
        // Optimize asset file naming
        assetFileNames: 'assets/[name].[hash].[ext]',
        // Ensure consistent chunking
        experimentalMinChunkSize: 10000,
      },
    },
    assetsInlineLimit: 4096, // Inline assets smaller than ~4kb
    cssCodeSplit: true, // Split CSS into multiple files
    sourcemap: process.env.NODE_ENV !== 'production', // Only in development
    // Pre-compress assets for faster serving
    outDir: 'dist',
  },
  optimizeDeps: {
    include: [
      // Core app dependencies to preload
      'react',
      'react-dom',
      'react-router-dom',
      '@chakra-ui/react',
      'react-redux',
      'i18next',
      'react-i18next',
      'socket.io-client',
    ],
    // Force optimization of certain dependencies
    force: true,
    // Optimize entries
    entries: ['./src/entry-client.jsx', './src/App.jsx'],
    // Exclude some dependencies from optimization
    exclude: [
      // Add any problematic dependencies that shouldn't be pre-bundled
    ],
    // Customize esbuild behavior
    esbuildOptions: {
      target: 'esnext',
      platform: 'browser',
      treeShaking: true,
    },
  },
  plugins: [
    react({
      // Improve development build time
      devTarget: 'es2020',
      // Enable fast refresh
      fastRefresh: true,
      // Configure SWC for optimal performance
      swcOptions: {
        jsc: {
          target: 'es2020',
          parser: {
            syntax: 'ecmascript',
            jsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
              refresh: true,
            },
          },
          minify: {
            compress: {
              unused: true,
            },
            mangle: true,
          },
        },
      },
    }),
    // Split vendor chunks automatically
    splitVendorChunkPlugin(),
    // Visualize bundle sizes
    visualizer({
      filename: 'stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    // Optimize development server
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: false,
    },
  },
  css: {
    // Optimize CSS processing
    devSourcemap: true,
    preprocessorOptions: {
      // Add any CSS preprocessor options here
    },
  },
  // Enable client-side environment variables for better loading conditions
  define: {
    'import.meta.env.MODE': JSON.stringify(
      process.env.NODE_ENV || 'development',
    ),
    'import.meta.env.PROD': process.env.NODE_ENV === 'production',
    'import.meta.env.DEV': process.env.NODE_ENV !== 'production',
  },
  // Resolve configuration
  resolve: {
    // Add aliases if needed for better imports
    alias: {
      // '@': '/src', // Uncomment if you want to use @ as an alias for /src
    },
  },
  // Optimize browser targets
  esbuild: {
    target: ['esnext'],
  },
})
