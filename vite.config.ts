import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/Friend-SOS/',
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          manifest: {
            name: 'Friend SOS - Emergency Alert PWA',
            short_name: 'Friend SOS',
            description: 'Quick emergency alerts with AI assistance',
            theme_color: '#DC2626',
            background_color: '#111827',
            display: 'standalone',
            icons: [
              {
                src: '/icons/icon-72.png',
                sizes: '72x72',
                type: 'image/png'
              },
              {
                src: '/icons/icon-96.png',
                sizes: '96x96',
                type: 'image/png'
              },
              {
                src: '/icons/icon-128.png',
                sizes: '128x128',
                type: 'image/png'
              },
              {
                src: '/icons/icon-144.png',
                sizes: '144x144',
                type: 'image/png'
              },
              {
                src: '/icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: '/icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: '/icons/maskable-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
              },
              {
                src: '/icons/maskable-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
              }
            ],
            start_url: '/Friend-SOS/',
            scope: '/Friend-SOS/',
            orientation: 'any'
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/cdn\.tailwindcss\.com/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'tailwind-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
                  }
                }
              }
            ]
          },
          devOptions: {
            enabled: true,
            type: 'module'
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
        'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
