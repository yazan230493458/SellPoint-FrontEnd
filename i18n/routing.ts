import { defineRouting } from "next-intl/routing";
import { defaultLocale, localeCodes } from "./locales";

export const routing = defineRouting({
  locales: localeCodes,
  defaultLocale,
  localePrefix: "always",
  localeDetection: false,
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  },
});
