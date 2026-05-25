# Eclectic Byte

Astro-based company site for Eclectic Byte.

## Structure

- `src/`: site pages and layout
- `video-compressor/legal/`: source legal documents for the Video Compressor product
- `eclectic-byte-logo-placeholder.svg`: repository-level placeholder logo asset

## Commands

- `npm run dev`
- `npm run build`
- `npm run preview`

## SEO Config

- Set `SITE_URL` or `PUBLIC_SITE_URL` before production builds so canonical URLs, social image URLs, `robots.txt`, and the sitemap use the deployed domain.
- Without a site URL, the layout emits `noindex, nofollow` and `robots.txt` disallows crawling to avoid publishing incorrect canonicals.
