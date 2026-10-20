const siteUrlValue = import.meta.env.SITE_URL ?? import.meta.env.PUBLIC_SITE_URL ?? "";

export const siteConfig = {
	siteName: "Eclectic Byte",
	siteTagline: "Eclectic Byte builds focused software with clear, durable product surfaces.",
	siteDescription:
		"Eclectic Byte is a small software studio building focused mobile apps and commerce products.",
	siteUrl: siteUrlValue,
	locale: "en_US",
	dateLocale: "en-US",
	socialCardPath: "/social-card.svg",
	brandMarkPath: "/favicon.svg",
	companyType: "Organization"
} as const;

export const habitoroConfig = {
	productName: "Habitoro",
	heroDescription:
		"A calm habit and focus app for building routines, running focused sessions, and seeing steady progress.",
	websiteUrl: "https://www.habitoro.site/",
	appStoreUrl: "https://apps.apple.com/app/habitoro/id6759099801"
} as const;

export const videoCompressorConfig = {
	productName: "Video Compressor",
	heroDescription:
		"A straightforward product surface for compressing and exporting video with less friction and clearer defaults.",
	privacyDescription: "How Video Compressor handles local processing, subscriptions, and support.",
	termsDescription: "The operational terms covering subscriptions, acceptable use, and support.",
	supportEmail: "eclecticbyte@ymail.com",
	supportDescription: "Support information for Video Compressor, including purchase and subscription help."
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
	},
	{
		href: "/video-compressor/legal/support",
		label: "Support",
		description: videoCompressorConfig.supportDescription
	}
] as const;

interface ProjectLink {
	href: string;
	label: string;
	external: boolean;
}

interface Project {
	name: string;
	mark: string;
	category: string;
	description: string;
	tags: readonly string[];
	availability: string;
	link?: ProjectLink;
}

export const projects: readonly Project[] = [
	{
		name: habitoroConfig.productName,
		mark: "HA",
		category: "Habit and focus app",
		description:
			"Build habits, run focus sessions, and see your progress in a motivating iOS experience designed without clutter.",
		tags: ["iOS", "Habits", "Focus"],
		availability: "Available now",
		link: {
			href: habitoroConfig.websiteUrl,
			label: "Visit Habitoro",
			external: true
		}
	},
	{
		name: "VatLoom",
		mark: "VL",
		category: "Shopify VAT reporting",
		description:
			"Turns Shopify order and refund data into reviewable EU OSS VAT reports, corrections, and export-ready working papers.",
		tags: ["Shopify", "EU OSS", "Reporting"],
		availability: "Private pilot"
	},
	{
		name: "Bol Connect",
		mark: "BC",
		category: "Commerce integration",
		description:
			"Connects Shopify and bol.com operations across product matching, inventory, orders, fulfillment, and returns.",
		tags: ["Shopify", "bol.com", "Sync"],
		availability: "Client rollout"
	},
	{
		name: videoCompressorConfig.productName,
		mark: "VC",
		category: "Mobile utility",
		description:
			"A focused iOS utility for compressing and exporting video with less friction and clearer defaults.",
		tags: ["iOS", "Media", "Local-first"],
		availability: "Live app",
		link: {
			href: "#legal",
			label: "View product resources",
			external: false
		}
	}
];

export function buildAbsoluteUrl(pathname: string): string | undefined {
	if (!siteConfig.siteUrl) {
		return undefined;
	}

	return new URL(pathname, siteConfig.siteUrl).toString();
}
