// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

const site = process.env.SITE_URL ?? process.env.PUBLIC_SITE_URL;

// https://astro.build/config
export default defineConfig({
  site,
  integrations: site ? [sitemap()] : [],
  adapter: cloudflare(),
});