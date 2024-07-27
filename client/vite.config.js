import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: {
    target: "esnext",
  },
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: "Rapid Recap",
        short_name: "RapidRecap",
        description: "Stay Informed, Stay Ahead with Rapid Recap",
        theme_color: "#1a1527",
        background_color: "#0f0d15",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/images/rrlogo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/rrlogo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
});
