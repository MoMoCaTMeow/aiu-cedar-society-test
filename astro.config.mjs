// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://momo1105.com',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    domains: ['images.microcms-assets.io'],
    remotePatterns: [{
      protocol: 'https',
      hostname: '**.microcms-assets.io',
    }],
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    ssr: {
      noExternal: [],
    },
  },
});