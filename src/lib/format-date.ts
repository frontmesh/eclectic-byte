import { siteConfig } from "../site-config";

const dateFormatter = new Intl.DateTimeFormat(siteConfig.dateLocale, {
	year: "numeric",
	month: "long",
	day: "numeric",
	timeZone: "UTC"
});

export function formatPostDate(date: Date): string {
	return dateFormatter.format(date);
}
