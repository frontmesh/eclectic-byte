# Eclectic Byte

Astro-based company site for Eclectic Byte.

## Structure

- `src/`: site pages, layouts, components, and configuration
- `src/pages/vatloom/`: VatLoom landing page
- `src/content/blog/`: Markdown blog posts
- `video-compressor/legal/`: source legal documents for the Video Compressor product
- `public/brand/`: production logo lockup and mark assets in SVG and PNG formats

## Contact Emails

- Studio and VatLoom contact: `eclecticbyte@proton.me`
- Video Compressor support: `eclecticbyte@ymail.com`

The Video Compressor address is also stored in `videoCompressorConfig.supportEmail`. Keep it aligned with App Store Connect until the support address is changed there.

## VatLoom Landing Page

VatLoom is a Shopify app. Its public page lives at `/vatloom/` and is configured in `vatLoomConfig` in `src/site-config.ts`.

- `status: "review"` shows the launch-list call to action and the “In Shopify review” status on both the homepage and the VatLoom page.
- `status: "live"` requires `listingUrl`; the build fails if it is missing. The primary CTA becomes the Shopify install link with the 14-day trial.
- `launchListUrl` accepts a hosted signup form URL (Buttondown, Tally, or similar).
- `buttondownUsername` plus `privacyUrl` enables the embedded Buttondown form. The form is intentionally withheld until both values exist.
- With no hosted URL, Buttondown username, or privacy URL, the page falls back to a prefilled `mailto:` link. That is a working contact path, not a mailing list.

To enable the embedded launch list:

1. Create a Buttondown account and enable double opt-in.
2. Set `buttondownUsername` and `privacyUrl` in `vatLoomConfig`.
3. Set `supportUrl` if VatLoom has a dedicated support page; otherwise the page uses the studio email.
4. Rebuild and test the signup, confirmation, and unsubscribe flow.

VatLoom’s page must not claim filing, tax advice, collaboration, multi-store support, threshold monitoring, or a privacy guarantee that has not been verified. The sample report is illustrative and must stay labeled as such. Merchant case-study material and screenshots require merchant approval before publication.

## Legal Source Of Truth

- Public legal index: `/legal/`
- Canonical public legal source: `video-compressor/legal/`
- Canonical support email for Video Compressor: `eclecticbyte@ymail.com`
- Keep App Store Connect privacy answers, support metadata, and live legal pages aligned with these files before submission updates

## Blog

Posts live in `src/content/blog/` as Markdown files. Frontmatter requires `title`, `description`, and `publishedAt`; `author` and `draft` are optional. The blog index, post pages, homepage teaser, and sitemap entries are generated from that collection.

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
