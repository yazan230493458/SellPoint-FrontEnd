"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { isAppLocale, type AppLocale } from "@/i18n/locales";

const confirmedLocaleKey = "sp-confirmed-locale";

export const confirmSavedLocale = (locale: AppLocale) => {
  try {
    sessionStorage.setItem(confirmedLocaleKey, locale);
    localStorage.setItem(confirmedLocaleKey, locale);
  } catch {
    // Ignore storage failures (private mode / quota).
  }
};

const readConfirmedLocale = (): AppLocale | null => {
  try {
    const sessionValue = sessionStorage.getItem(confirmedLocaleKey);
    if (sessionValue && isAppLocale(sessionValue)) return sessionValue;
    const persistentValue = localStorage.getItem(confirmedLocaleKey);
    return persistentValue && isAppLocale(persistentValue)
      ? persistentValue
      : null;
  } catch {
    return null;
  }
};

const LocaleHistory = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const saved = readConfirmedLocale();
    if (!saved || saved === locale) return;
    router.replace(pathname, { locale: saved });
  }, [locale, pathname, router]);

  return null;
};

export default LocaleHistory;
