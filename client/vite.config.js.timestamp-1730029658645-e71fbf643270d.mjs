// ../client/vite.config.js
import { defineConfig } from "file:///Users/saranshmittal/Desktop/Rapid-Recap/client/node_modules/vite/dist/node/index.js";
import react from "file:///Users/saranshmittal/Desktop/Rapid-Recap/client/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { visualizer } from "file:///Users/saranshmittal/Desktop/Rapid-Recap/client/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import path from "path";
var __vite_injected_original_dirname = "/Users/saranshmittal/Desktop/Rapid-Recap/client";
var vite_config_default = defineConfig({
  build: {
    target: "esnext",
    outDir: "dist/client",
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(__vite_injected_original_dirname, "index.html"),
        "entry-server": path.resolve(__vite_injected_original_dirname, "src/entry-server.jsx")
      },
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]"
      }
    },
    ssrManifest: true
  },
  server: {
    port: 3e3,
    strictPort: true,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 24678,
      // Dedicated HMR port
      clientPort: 24678
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Proxying request:", req.method, req.url);
          });
        }
      },
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true
      }
    },
    watch: {
      // Use polling for better compatibility
      usePolling: true,
      interval: 100
    }
  },
  plugins: [
    react({
      fastRefresh: true,
      // Added development-only options
      jsxRuntime: process.env.NODE_ENV === "development" ? "automatic" : "classic",
      jsxImportSource: "@emotion/react",
      plugins: [["@swc/plugin-emotion", {}]]
    }),
    visualizer({
      filename: "stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src")
    }
  },
  // SSR specific configurations
  ssr: {
    // External packages that shouldn't be bundled in SSR
    external: [
      "use-sound",
      "howler",
      "socket.io-client",
      "react-ga4",
      "web-push",
      // Added more browser-only dependencies
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "window",
      "document",
      "history"
    ],
    // Packages that should be bundled even in SSR
    noExternal: [
      "@chakra-ui/react",
      "@emotion/react",
      "@emotion/styled",
      "framer-motion",
      "@chakra-ui/icons",
      "react-icons"
    ],
    target: "node",
    format: "cjs"
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@chakra-ui/react",
      "react-router-dom",
      "@reduxjs/toolkit",
      "@emotion/react",
      "@emotion/styled",
      "framer-motion",
      "i18next",
      "react-i18next"
    ],
    exclude: ["use-sound", "howler", "socket.io-client", "react-ga4"]
  },
  // Added to handle development errors better
  esbuild: {
    logLevel: "info",
    logLimit: 30,
    jsxInject: `import React from 'react'`
  },
  // Better error handling
  customLogger: {
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args),
    info: (...args) => console.log(...args)
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vY2xpZW50L3ZpdGUuY29uZmlnLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3NhcmFuc2htaXR0YWwvRGVza3RvcC9SYXBpZC1SZWNhcC9jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9zYXJhbnNobWl0dGFsL0Rlc2t0b3AvUmFwaWQtUmVjYXAvY2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9zYXJhbnNobWl0dGFsL0Rlc2t0b3AvUmFwaWQtUmVjYXAvY2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnXG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi12aXN1YWxpemVyJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgIG91dERpcjogJ2Rpc3QvY2xpZW50JyxcbiAgICBtYW5pZmVzdDogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICBtYWluOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnaW5kZXguaHRtbCcpLFxuICAgICAgICAnZW50cnktc2VydmVyJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9lbnRyeS1zZXJ2ZXIuanN4JyksXG4gICAgICB9LFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS5baGFzaF0uanMnLFxuICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0uW2hhc2hdLmpzJyxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLltoYXNoXS5bZXh0XScsXG4gICAgICB9LFxuICAgIH0sXG4gICAgc3NyTWFuaWZlc3Q6IHRydWUsXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBobXI6IHtcbiAgICAgIHByb3RvY29sOiAnd3MnLFxuICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgICBwb3J0OiAyNDY3OCwgLy8gRGVkaWNhdGVkIEhNUiBwb3J0XG4gICAgICBjbGllbnRQb3J0OiAyNDY3OCxcbiAgICB9LFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgX29wdGlvbnMpID0+IHtcbiAgICAgICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyLCBfcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygncHJveHkgZXJyb3InLCBlcnIpXG4gICAgICAgICAgfSlcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXEsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1Byb3h5aW5nIHJlcXVlc3Q6JywgcmVxLm1ldGhvZCwgcmVxLnVybClcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgICcvc29ja2V0LmlvJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAgICAgICB3czogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB3YXRjaDoge1xuICAgICAgLy8gVXNlIHBvbGxpbmcgZm9yIGJldHRlciBjb21wYXRpYmlsaXR5XG4gICAgICB1c2VQb2xsaW5nOiB0cnVlLFxuICAgICAgaW50ZXJ2YWw6IDEwMCxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3Qoe1xuICAgICAgZmFzdFJlZnJlc2g6IHRydWUsXG4gICAgICAvLyBBZGRlZCBkZXZlbG9wbWVudC1vbmx5IG9wdGlvbnNcbiAgICAgIGpzeFJ1bnRpbWU6XG4gICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8gJ2F1dG9tYXRpYycgOiAnY2xhc3NpYycsXG4gICAgICBqc3hJbXBvcnRTb3VyY2U6ICdAZW1vdGlvbi9yZWFjdCcsXG4gICAgICBwbHVnaW5zOiBbWydAc3djL3BsdWdpbi1lbW90aW9uJywge31dXSxcbiAgICB9KSxcbiAgICB2aXN1YWxpemVyKHtcbiAgICAgIGZpbGVuYW1lOiAnc3RhdHMuaHRtbCcsXG4gICAgICBvcGVuOiB0cnVlLFxuICAgICAgZ3ppcFNpemU6IHRydWUsXG4gICAgICBicm90bGlTaXplOiB0cnVlLFxuICAgIH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxuICAgIH0sXG4gIH0sXG4gIC8vIFNTUiBzcGVjaWZpYyBjb25maWd1cmF0aW9uc1xuICBzc3I6IHtcbiAgICAvLyBFeHRlcm5hbCBwYWNrYWdlcyB0aGF0IHNob3VsZG4ndCBiZSBidW5kbGVkIGluIFNTUlxuICAgIGV4dGVybmFsOiBbXG4gICAgICAndXNlLXNvdW5kJyxcbiAgICAgICdob3dsZXInLFxuICAgICAgJ3NvY2tldC5pby1jbGllbnQnLFxuICAgICAgJ3JlYWN0LWdhNCcsXG4gICAgICAnd2ViLXB1c2gnLFxuICAgICAgLy8gQWRkZWQgbW9yZSBicm93c2VyLW9ubHkgZGVwZW5kZW5jaWVzXG4gICAgICAnbG9jYWxTdG9yYWdlJyxcbiAgICAgICdzZXNzaW9uU3RvcmFnZScsXG4gICAgICAnaW5kZXhlZERCJyxcbiAgICAgICd3aW5kb3cnLFxuICAgICAgJ2RvY3VtZW50JyxcbiAgICAgICdoaXN0b3J5JyxcbiAgICBdLFxuICAgIC8vIFBhY2thZ2VzIHRoYXQgc2hvdWxkIGJlIGJ1bmRsZWQgZXZlbiBpbiBTU1JcbiAgICBub0V4dGVybmFsOiBbXG4gICAgICAnQGNoYWtyYS11aS9yZWFjdCcsXG4gICAgICAnQGVtb3Rpb24vcmVhY3QnLFxuICAgICAgJ0BlbW90aW9uL3N0eWxlZCcsXG4gICAgICAnZnJhbWVyLW1vdGlvbicsXG4gICAgICAnQGNoYWtyYS11aS9pY29ucycsXG4gICAgICAncmVhY3QtaWNvbnMnLFxuICAgIF0sXG4gICAgdGFyZ2V0OiAnbm9kZScsXG4gICAgZm9ybWF0OiAnY2pzJyxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogW1xuICAgICAgJ3JlYWN0JyxcbiAgICAgICdyZWFjdC1kb20nLFxuICAgICAgJ0BjaGFrcmEtdWkvcmVhY3QnLFxuICAgICAgJ3JlYWN0LXJvdXRlci1kb20nLFxuICAgICAgJ0ByZWR1eGpzL3Rvb2xraXQnLFxuICAgICAgJ0BlbW90aW9uL3JlYWN0JyxcbiAgICAgICdAZW1vdGlvbi9zdHlsZWQnLFxuICAgICAgJ2ZyYW1lci1tb3Rpb24nLFxuICAgICAgJ2kxOG5leHQnLFxuICAgICAgJ3JlYWN0LWkxOG5leHQnLFxuICAgIF0sXG4gICAgZXhjbHVkZTogWyd1c2Utc291bmQnLCAnaG93bGVyJywgJ3NvY2tldC5pby1jbGllbnQnLCAncmVhY3QtZ2E0J10sXG4gIH0sXG4gIC8vIEFkZGVkIHRvIGhhbmRsZSBkZXZlbG9wbWVudCBlcnJvcnMgYmV0dGVyXG4gIGVzYnVpbGQ6IHtcbiAgICBsb2dMZXZlbDogJ2luZm8nLFxuICAgIGxvZ0xpbWl0OiAzMCxcbiAgICBqc3hJbmplY3Q6IGBpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnYCxcbiAgfSxcbiAgLy8gQmV0dGVyIGVycm9yIGhhbmRsaW5nXG4gIGN1c3RvbUxvZ2dlcjoge1xuICAgIGVycm9yOiAoLi4uYXJncykgPT4gY29uc29sZS5lcnJvciguLi5hcmdzKSxcbiAgICB3YXJuOiAoLi4uYXJncykgPT4gY29uc29sZS53YXJuKC4uLmFyZ3MpLFxuICAgIGluZm86ICguLi5hcmdzKSA9PiBjb25zb2xlLmxvZyguLi5hcmdzKSxcbiAgfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStULFNBQVMsb0JBQW9CO0FBQzVWLE9BQU8sV0FBVztBQUNsQixTQUFTLGtCQUFrQjtBQUMzQixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsVUFBVTtBQUFBLElBQ1YsZUFBZTtBQUFBLE1BQ2IsT0FBTztBQUFBLFFBQ0wsTUFBTSxLQUFLLFFBQVEsa0NBQVcsWUFBWTtBQUFBLFFBQzFDLGdCQUFnQixLQUFLLFFBQVEsa0NBQVcsc0JBQXNCO0FBQUEsTUFDaEU7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLElBQ0EsYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLEtBQUs7QUFBQSxNQUNILFVBQVU7QUFBQSxNQUNWLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQTtBQUFBLE1BQ04sWUFBWTtBQUFBLElBQ2Q7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFdBQVcsQ0FBQyxPQUFPLGFBQWE7QUFDOUIsZ0JBQU0sR0FBRyxTQUFTLENBQUMsS0FBSyxNQUFNLFNBQVM7QUFDckMsb0JBQVEsSUFBSSxlQUFlLEdBQUc7QUFBQSxVQUNoQyxDQUFDO0FBQ0QsZ0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxLQUFLLFNBQVM7QUFDNUMsb0JBQVEsSUFBSSxxQkFBcUIsSUFBSSxRQUFRLElBQUksR0FBRztBQUFBLFVBQ3RELENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLE1BQ0EsY0FBYztBQUFBLFFBQ1osUUFBUTtBQUFBLFFBQ1IsSUFBSTtBQUFBLE1BQ047QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUE7QUFBQSxNQUVMLFlBQVk7QUFBQSxNQUNaLFVBQVU7QUFBQSxJQUNaO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLE1BQ0osYUFBYTtBQUFBO0FBQUEsTUFFYixZQUNFLFFBQVEsSUFBSSxhQUFhLGdCQUFnQixjQUFjO0FBQUEsTUFDekQsaUJBQWlCO0FBQUEsTUFDakIsU0FBUyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO0FBQUEsSUFDdkMsQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBLE1BQ1QsVUFBVTtBQUFBLE1BQ1YsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBLE1BQ1YsWUFBWTtBQUFBLElBQ2QsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxJQUNwQztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBRUEsS0FBSztBQUFBO0FBQUEsSUFFSCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLE1BRUE7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsWUFBWTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyxhQUFhLFVBQVUsb0JBQW9CLFdBQVc7QUFBQSxFQUNsRTtBQUFBO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixXQUFXO0FBQUEsRUFDYjtBQUFBO0FBQUEsRUFFQSxjQUFjO0FBQUEsSUFDWixPQUFPLElBQUksU0FBUyxRQUFRLE1BQU0sR0FBRyxJQUFJO0FBQUEsSUFDekMsTUFBTSxJQUFJLFNBQVMsUUFBUSxLQUFLLEdBQUcsSUFBSTtBQUFBLElBQ3ZDLE1BQU0sSUFBSSxTQUFTLFFBQVEsSUFBSSxHQUFHLElBQUk7QUFBQSxFQUN4QztBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
