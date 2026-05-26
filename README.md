# Eclectic Byte

Astro-based company site for Eclectic Byte.

## Structure

- `src/`: site pages and layout
- `video-compressor/legal/`: source legal documents for the Video Compressor product
- `eclectic-byte-logo-placeholder.svg`: repository-level placeholder logo asset

## Legal Source Of Truth

- Canonical public legal source: `video-compressor/legal/`
- Canonical support email for Video Compressor: `eclecticbyte@ymail.com`
- Keep App Store Connect privacy answers, support metadata, and live legal pages aligned with these files before submission updates

## Commands

- `npm run dev`
- `npm run build`
- `npm run preview`

## SEO Config

- Set `SITE_URL` or `PUBLIC_SITE_URL` before production builds so canonical URLs, social image URLs, `robots.txt`, and the sitemap use the deployed domain.
- Without a site URL, the layout emits `noindex, nofollow` and `robots.txt` disallows crawling to avoid publishing incorrect canonicals.

## Cloudflare Pages

Use Cloudflare Pages Git integration for this repository.

Recommended Pages settings:

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root

Required environment variables:

- `SITE_URL`: your production site URL, for example `https://eclecticbyte.com`

Notes:

- Node is pinned for Pages builds via [`.node-version`](/Users/vv/Projects/Marketing/eclectic-byte/.node-version) because Pages does not use `package.json` `engines` detection for build image version selection.
- Do not add a Pages `wrangler.toml` or `wrangler.jsonc` unless you intentionally move this project to Wrangler-managed deployment or Pages Functions config. The current setup is for dashboard Git integration.
