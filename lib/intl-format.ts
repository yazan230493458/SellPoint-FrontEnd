import { getLocaleIntl } from "@/i18n/locales";

export const formatDateTime = (
  value: Date | string | number | null | undefined,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
) => {
  if (value === null || value === undefined || value === "") return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(getLocaleIntl(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(date);
};

export const formatDate = (
  value: Date | string | number | null | undefined,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
) =>
  formatDateTime(value, locale, {
    hour: undefined,
    minute: undefined,
    ...options,
  });

export const formatNumber = (
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
) => new Intl.NumberFormat(getLocaleIntl(locale), options).format(value);

export const formatCurrency = (
  value: number,
  locale: string,
  currency = "SAR",
  options?: Intl.NumberFormatOptions,
) =>
  new Intl.NumberFormat(getLocaleIntl(locale), {
    style: "currency",
    currency,
    ...options,
  }).format(value);

export const formatPercent = (
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
) =>
  new Intl.NumberFormat(getLocaleIntl(locale), {
    style: "percent",
    ...options,
  }).format(value);

export const formatRelativeTime = (
  value: Date | string | number,
  locale: string,
) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat(getLocaleIntl(locale), {
    numeric: "auto",
  });
  if (abs < 60) return rtf.format(diffSeconds, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diffSeconds / 86400), "day");
  if (abs < 86400 * 365)
    return rtf.format(Math.round(diffSeconds / (86400 * 30)), "month");
  return rtf.format(Math.round(diffSeconds / (86400 * 365)), "year");
};
