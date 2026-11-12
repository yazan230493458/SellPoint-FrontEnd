import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { deepMergeMessages } from "./deep-merge";
import { defaultLocale } from "./locales";

const loadMessages = async (locale: string) => {
  try {
    return (await import(`../messages/${locale}.json`)).default as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  const english = (await loadMessages(defaultLocale)) ?? {};
  if (locale === defaultLocale) {
    return { locale, messages: english };
  }

  const localized = await loadMessages(locale);
  return {
    locale,
    messages: localized ? deepMergeMessages(english, localized) : english,
  };
});
