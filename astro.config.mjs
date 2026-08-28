import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://fastuuidgenerator.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/en/'),
    }),
  ],
});
