import type { APIRoute } from "astro";
import { siteConfig } from "../site-config";

function buildRobotsTxt(site: URL | undefined): string {
	if (!site || !siteConfig.siteUrl) {
		return ["User-agent: *", "Disallow: /"].join("\n");
	}

	const sitemapUrl = new URL("sitemap-index.xml", site);

	return ["User-agent: *", "Allow: /", `Sitemap: ${sitemapUrl.href}`].join("\n");
}

export const GET: APIRoute = ({ site }) =>
	new Response(buildRobotsTxt(site), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8"
		}
	});
