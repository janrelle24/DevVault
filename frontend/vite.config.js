import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'DevVault',
                short_name: 'DevVault',
                description: 'Your personal development documentation hub',
                start_url: '/',
                display: 'standalone',
                background_color: '#0a0b10',
                theme_color: '#7c5cfc',
                icons: [
                    { src: '/devvault-logo-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/devvault-logo-512x512.png', sizes: '512x512', type: 'image/png' },
                    { src: '/devvault-logo-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
                ]
            },
            workbox: {
                // Include images/fonts so logos load offline too.
                globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/api/],
                runtimeCaching: [
                    {
                        // Public, read-only endpoints only
                        urlPattern: ({ url }) =>
                            /^\/api\/(categories|documents|tags)(\/|$)/.test(url.pathname),
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'devvault-api',
                            networkTimeoutSeconds: 4,
                            expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 30 },
                            cacheableResponse: { statuses: [200] }
                        }
                    }
                ]
            },
            devOptions: { enabled: false }
        })
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true
            }
        }
    }
});