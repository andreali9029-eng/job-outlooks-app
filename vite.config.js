import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Canada Job Outlooks',
        short_name: 'JobOutlooks',
        description: 'Explore employment prospects across Canada / Explorez les perspectives d\'emploi au Canada',
        lang: 'en',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Only precache app shell (js/css/html/icons). Data files are fetched
        // on demand per occupation and handled by runtime caching below.
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        runtimeCaching: [
          {
            // Occupation list (small, changes rarely) - stale while revalidate
            urlPattern: ({ url }) => url.pathname.endsWith('/data/occupations.json'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'occupations-list',
              expiration: { maxEntries: 1, maxAgeSeconds: 7 * 24 * 3600 }
            }
          },
          {
            // Per-occupation data files - network first (fresh), cache fallback
            urlPattern: ({ url }) => url.pathname.includes('/data/occ/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'occupation-data',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 3600 },
              networkTimeoutSeconds: 5
            }
          },
          {
            // Trend / jobcounts / job preview data - stale while revalidate (updated daily)
            urlPattern: ({ url }) => url.pathname.includes('/data/trends/') || url.pathname.includes('/data/jobs-preview.json'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'trend-data',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 3600 }
            }
          }
        ]
      }
    })
  ]
})
