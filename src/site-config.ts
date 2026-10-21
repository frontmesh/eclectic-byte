const siteUrlValue = import.meta.env.SITE_URL ?? import.meta.env.PUBLIC_SITE_URL ?? "";

export const siteConfig = {
	siteName: "Eclectic Byte",
	siteTagline: "Specialized software for practical problems.",
	siteDescription:
		"Vladimir Vujosevic builds VatLoom, Habitoro, and focused iOS utilities, plus private commerce integrations for Shopify stores.",
	siteUrl: siteUrlValue,
	locale: "en_US",
	dateLocale: "en-US",
	socialCardPath: "/social-card.svg",
	brandMarkPath: "/brand/eclectic-byte-mark.svg",
	brandMarkType: "image/svg+xml",
	privacyPath: "/privacy/",
	companyType: "Organization",
	founder: {
		name: "Vladimir Vujosevic",
		email: "eclecticbyte@proton.me"
	}
} as const;

type VatLoomStatus = "review" | "live";

interface VatLoomConfig {
	productName: string;
	path: string;
	status: VatLoomStatus;
	listingUrl: string;
	buttondownUsername: string;
	privacyUrl: string;
	supportUrl: string;
	trialDays: number;
	priceMonthly: number;
	priceAnnual: number;
	currency: string;
	tagline: string;
	description: string;
}

export const vatLoomConfig: VatLoomConfig = {
	productName: "VatLoom",
	path: "/vatloom/",
	status: "review",
	listingUrl: "",
	buttondownUsername: "eclecticbyte",
	privacyUrl: "https://vatloom-public.proptech.workers.dev/privacy",
	supportUrl: "https://vatloom-public.proptech.workers.dev/support",
	trialDays: 14,
	priceMonthly: 4.99,
	priceAnnual: 39.99,
	currency: "USD",
	tagline: "EU OSS VAT reports from Shopify, without the spreadsheet.",
	description:
		"VatLoom organizes Shopify orders and refunds into country-and-rate OSS summaries and exportable working papers."
};

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
		"A small iOS utility for compressing and exporting video with less friction and clearer defaults.",
	privacyDescription: "How Video Compressor handles local processing, subscriptions, and support.",
	termsDescription: "The operational terms covering subscriptions, acceptable use, and support.",
	supportEmail: "eclecticbyte@ymail.com",
	supportDescription: "Support information for Video Compressor, including purchase and subscription help."
} as const;

export const legalLinks = [
	{
		href: "/video-compressor/legal/privacy-policy/",
		label: "Privacy Policy",
		description: videoCompressorConfig.privacyDescription
	},
	{
		href: "/video-compressor/legal/terms-of-service/",
		label: "Terms of Service",
		description: videoCompressorConfig.termsDescription
	},
	{
		href: "/video-compressor/legal/support/",
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
	featured?: boolean;
	link?: ProjectLink;
}

export const projects: readonly Project[] = [
	{
		name: vatLoomConfig.productName,
		mark: "VL",
		category: "EU OSS VAT for Shopify",
		description:
			"Organizes Shopify orders and refunds into country-and-rate OSS summaries and exportable working papers.",
		tags: ["Shopify", "EU OSS", "Reporting"],
		availability: vatLoomConfig.status === "live" ? "Live" : "In Shopify review",
		featured: true,
		link: {
			href: vatLoomConfig.path,
			label: "See VatLoom",
			external: false
		}
	},
	{
		name: habitoroConfig.productName,
		mark: "HA",
		category: "Habit and focus app",
		description: "Build habits, run focus sessions, and see steady progress in a calm iOS app.",
		tags: ["iOS", "Habits", "Focus"],
		availability: "Live",
		link: {
			href: habitoroConfig.websiteUrl,
			label: "Visit Habitoro",
			external: true
		}
	},
	{
		name: "Shopify × bol.com",
		mark: "SB",
		category: "Client commerce integration",
		description:
			"A private integration covering product matching, inventory, orders, fulfillment, and returns.",
		tags: ["Shopify", "bol.com", "Sync"],
		availability: "Client work"
	},
	{
		name: videoCompressorConfig.productName,
		mark: "VC",
		category: "Mobile utility",
		description: "Compresses and exports video on iOS with fewer steps and clearer defaults.",
		tags: ["iOS", "Media", "Local-first"],
		availability: "Live",
		link: {
			href: "/legal/",
			label: "Support & legal",
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
