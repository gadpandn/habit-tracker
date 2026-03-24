import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    VitePWA({
      injectRegister: null,
      registerType: "prompt",
      includeAssets: [
        "pwa-192.png",
        "pwa-512.png",
        "pwa-512-maskable.png"
      ],      manifest: {
        name: "Habit Tracker",
        short_name: "Habits",
        description: "Track daily habits offline.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/pwa-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ],
  test: {
    //environment: "jsdom",
     environment: "happy-dom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
})
