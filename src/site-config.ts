const siteUrlValue = import.meta.env.SITE_URL ?? import.meta.env.PUBLIC_SITE_URL ?? "";

export const siteConfig = {
	siteName: "Eclectic Byte",
	siteTagline: "Eclectic Byte builds focused software with clear, durable product surfaces.",
	siteDescription:
		"Eclectic Byte is a compact software studio site with legal resources for the Video Compressor product.",
	siteUrl: siteUrlValue,
	locale: "en_US",
	socialCardPath: "/social-card.svg",
	brandMarkPath: "/favicon.svg",
	companyType: "Organization"
} as const;

export const videoCompressorConfig = {
	productName: "Video Compressor",
	heroDescription:
		"A straightforward product surface for compressing and exporting video with less friction and clearer defaults.",
	privacyDescription: "How Video Compressor handles account, support, and usage data.",
	termsDescription: "The operational terms covering access, acceptable use, and support."
} as const;

export const legalLinks = [
	{
		href: "/video-compressor/legal/privacy-policy",
		label: "Privacy Policy",
		description: videoCompressorConfig.privacyDescription
	},
	{
		href: "/video-compressor/legal/terms-of-service",
		label: "Terms of Service",
		description: videoCompressorConfig.termsDescription
	}
] as const;

export function buildAbsoluteUrl(pathname: string): string | undefined {
	if (!siteConfig.siteUrl) {
		return undefined;
	}

	return new URL(pathname, siteConfig.siteUrl).toString();
}
