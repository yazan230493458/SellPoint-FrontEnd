import type { Metadata } from "next";
import { headers } from "next/headers";
import { Cairo, Noto_Sans_Hebrew } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getLocale,
  setRequestLocale,
  getTranslations,
} from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import MobileNav from "./components/main/MobileNav";
import SessionBridge from "./components/session-bridge";
import LocaleHistory from "./components/locale-history";
import {
  arabicScriptLocales,
  getLocaleConfig,
  isAppLocale,
  isRtlLocale,
  localeCodes,
  type AppLocale,
} from "@/i18n/locales";

export function generateStaticParams() {
  return localeCodes.map((locale) => ({ locale }));
}

const authorFont = localFont({
  src: "../../public/Fonts/Author_Complete/Author-Extralight.otf",
  variable: "--font-author",
  display: "swap",
});

const cairoFont = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const hebrewFont = Noto_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  variable: "--font-hebrew",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale || "en",
    namespace: "Metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const resolvedParams = await params;
  const currentLocale = resolvedParams?.locale || (await getLocale());
  setRequestLocale(currentLocale);
  const messages = await getMessages();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const config = getLocaleConfig(currentLocale);
  const dir = config.dir;
  const rtl = isRtlLocale(currentLocale);
  const localeCode = (
    isAppLocale(currentLocale) ? currentLocale : "en"
  ) as AppLocale;
  const useArabicFont = arabicScriptLocales.has(localeCode);
  const useHebrewFont = localeCode === "he";

  return (
    <html
      lang={currentLocale}
      dir={dir}
      suppressHydrationWarning
      className={`${authorFont.variable} ${cairoFont.variable} ${hebrewFont.variable} h-full antialiased`}
    >
      <body
        className={`min-h-full ${
          useArabicFont
            ? "font-[family-name:var(--font-cairo)]"
            : useHebrewFont
              ? "font-[family-name:var(--font-hebrew)]"
              : "font-author"
        }`}
      >
        <NextIntlClientProvider locale={currentLocale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={true}
            disableTransitionOnChange
            nonce={nonce}
          >
            <div
              className="min-h-dvh min-w-0 overflow-x-clip pb-[var(--mobile-nav-height)] md:pb-0"
              data-rtl={rtl ? "true" : "false"}
            >
              <SessionBridge />
              <LocaleHistory />
              {children}
            </div>
            <MobileNav />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
