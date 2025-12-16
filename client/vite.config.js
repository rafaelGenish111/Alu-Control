import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as pwa from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    (pwa.VitePWA ?? pwa.default)({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'installer-icon.svg', 'installer-icon-512.svg'],
      manifest: {
        name: 'Glass Dynamic – Installer',
        short_name: 'Installer',
        description: 'Installer app for Glass Dynamic',
        start_url: '/installer',
        scope: '/',
        display: 'standalone',
        background_color: '#020617',
        theme_color: '#1e40af',
        icons: [
          {
            src: '/installer-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/installer-icon-512.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0', // allow access from any device on the local network
    port: 5173,
  },
})
