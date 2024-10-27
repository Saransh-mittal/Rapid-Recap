import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist/client',
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        'entry-server': path.resolve(__dirname, 'src/entry-server.jsx'),
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    ssrManifest: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 24678, // Dedicated HMR port
      clientPort: 24678,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying request:', req.method, req.url)
          })
        },
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
    watch: {
      // Use polling for better compatibility
      usePolling: true,
      interval: 100,
    },
  },
  plugins: [
    react({
      fastRefresh: true,
      // Added development-only options
      jsxRuntime:
        process.env.NODE_ENV === 'development' ? 'automatic' : 'classic',
      jsxImportSource: '@emotion/react',
      plugins: [['@swc/plugin-emotion', {}]],
    }),
    visualizer({
      filename: 'stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // SSR specific configurations
  ssr: {
    // External packages that shouldn't be bundled in SSR
    external: [
      'use-sound',
      'howler',
      'socket.io-client',
      'react-ga4',
      'web-push',
      // Added more browser-only dependencies
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'window',
      'document',
      'history',
    ],
    // Packages that should be bundled even in SSR
    noExternal: [
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion',
      '@chakra-ui/icons',
      'react-icons',
    ],
    target: 'node',
    format: 'cjs',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@chakra-ui/react',
      'react-router-dom',
      '@reduxjs/toolkit',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion',
      'i18next',
      'react-i18next',
    ],
    exclude: ['use-sound', 'howler', 'socket.io-client', 'react-ga4'],
  },
  // Added to handle development errors better
  esbuild: {
    logLevel: 'info',
    logLimit: 30,
    jsxInject: `import React from 'react'`,
  },
  // Better error handling
  customLogger: {
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args),
    info: (...args) => console.log(...args),
  },
})
