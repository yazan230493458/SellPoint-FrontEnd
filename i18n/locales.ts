export type LocaleGroup =
  | "major"
  | "european"
  | "middleEast"
  | "asian"
  | "african"
  | "other";

export type AppLocaleConfig = {
  code: string;
  nativeName: string;
  englishName: string;
  dir: "ltr" | "rtl";
  intl: string;
  group: LocaleGroup;
};

export const LOCALES = [
  { code: "en", nativeName: "English", englishName: "English", dir: "ltr", intl: "en-US", group: "major" },
  { code: "ar", nativeName: "العربية", englishName: "Arabic", dir: "rtl", intl: "ar-SA", group: "major" },
  { code: "es", nativeName: "Español", englishName: "Spanish", dir: "ltr", intl: "es-ES", group: "major" },
  { code: "fr", nativeName: "Français", englishName: "French", dir: "ltr", intl: "fr-FR", group: "major" },
  { code: "de", nativeName: "Deutsch", englishName: "German", dir: "ltr", intl: "de-DE", group: "major" },
  { code: "zh-CN", nativeName: "简体中文", englishName: "Chinese Simplified", dir: "ltr", intl: "zh-CN", group: "major" },
  { code: "zh-TW", nativeName: "繁體中文", englishName: "Chinese Traditional", dir: "ltr", intl: "zh-TW", group: "major" },
  { code: "ja", nativeName: "日本語", englishName: "Japanese", dir: "ltr", intl: "ja-JP", group: "major" },
  { code: "ko", nativeName: "한국어", englishName: "Korean", dir: "ltr", intl: "ko-KR", group: "major" },
  { code: "pt", nativeName: "Português", englishName: "Portuguese", dir: "ltr", intl: "pt-PT", group: "major" },
  { code: "pt-BR", nativeName: "Português (Brasil)", englishName: "Brazilian Portuguese", dir: "ltr", intl: "pt-BR", group: "major" },
  { code: "ru", nativeName: "Русский", englishName: "Russian", dir: "ltr", intl: "ru-RU", group: "major" },
  { code: "tr", nativeName: "Türkçe", englishName: "Turkish", dir: "ltr", intl: "tr-TR", group: "major" },
  { code: "it", nativeName: "Italiano", englishName: "Italian", dir: "ltr", intl: "it-IT", group: "major" },
  { code: "nl", nativeName: "Nederlands", englishName: "Dutch", dir: "ltr", intl: "nl-NL", group: "major" },
  { code: "hi", nativeName: "हिन्दी", englishName: "Hindi", dir: "ltr", intl: "hi-IN", group: "major" },
  { code: "ur", nativeName: "اردو", englishName: "Urdu", dir: "rtl", intl: "ur-PK", group: "major" },
  { code: "id", nativeName: "Bahasa Indonesia", englishName: "Indonesian", dir: "ltr", intl: "id-ID", group: "major" },
  { code: "ms", nativeName: "Bahasa Melayu", englishName: "Malay", dir: "ltr", intl: "ms-MY", group: "major" },
  { code: "bn", nativeName: "বাংলা", englishName: "Bengali", dir: "ltr", intl: "bn-BD", group: "major" },
  { code: "fa", nativeName: "فارسی", englishName: "Persian", dir: "rtl", intl: "fa-IR", group: "major" },
  { code: "th", nativeName: "ไทย", englishName: "Thai", dir: "ltr", intl: "th-TH", group: "major" },
  { code: "vi", nativeName: "Tiếng Việt", englishName: "Vietnamese", dir: "ltr", intl: "vi-VN", group: "major" },
  { code: "pl", nativeName: "Polski", englishName: "Polish", dir: "ltr", intl: "pl-PL", group: "major" },
  { code: "uk", nativeName: "Українська", englishName: "Ukrainian", dir: "ltr", intl: "uk-UA", group: "major" },
  { code: "sv", nativeName: "Svenska", englishName: "Swedish", dir: "ltr", intl: "sv-SE", group: "european" },
  { code: "nb", nativeName: "Norsk Bokmål", englishName: "Norwegian Bokmål", dir: "ltr", intl: "nb-NO", group: "european" },
  { code: "da", nativeName: "Dansk", englishName: "Danish", dir: "ltr", intl: "da-DK", group: "european" },
  { code: "fi", nativeName: "Suomi", englishName: "Finnish", dir: "ltr", intl: "fi-FI", group: "european" },
  { code: "el", nativeName: "Ελληνικά", englishName: "Greek", dir: "ltr", intl: "el-GR", group: "european" },
  { code: "he", nativeName: "עברית", englishName: "Hebrew", dir: "rtl", intl: "he-IL", group: "middleEast" },
  { code: "ro", nativeName: "Română", englishName: "Romanian", dir: "ltr", intl: "ro-RO", group: "european" },
  { code: "cs", nativeName: "Čeština", englishName: "Czech", dir: "ltr", intl: "cs-CZ", group: "european" },
  { code: "hu", nativeName: "Magyar", englishName: "Hungarian", dir: "ltr", intl: "hu-HU", group: "european" },
  { code: "bg", nativeName: "Български", englishName: "Bulgarian", dir: "ltr", intl: "bg-BG", group: "european" },
  { code: "hr", nativeName: "Hrvatski", englishName: "Croatian", dir: "ltr", intl: "hr-HR", group: "european" },
  { code: "sr", nativeName: "Српски", englishName: "Serbian", dir: "ltr", intl: "sr-RS", group: "european" },
  { code: "sk", nativeName: "Slovenčina", englishName: "Slovak", dir: "ltr", intl: "sk-SK", group: "european" },
  { code: "sl", nativeName: "Slovenščina", englishName: "Slovenian", dir: "ltr", intl: "sl-SI", group: "european" },
  { code: "sw", nativeName: "Kiswahili", englishName: "Swahili", dir: "ltr", intl: "sw-KE", group: "african" },
  { code: "fil", nativeName: "Filipino", englishName: "Filipino", dir: "ltr", intl: "fil-PH", group: "asian" },
  { code: "ta", nativeName: "தமிழ்", englishName: "Tamil", dir: "ltr", intl: "ta-IN", group: "asian" },
  { code: "te", nativeName: "తెలుగు", englishName: "Telugu", dir: "ltr", intl: "te-IN", group: "asian" },
  { code: "mr", nativeName: "मराठी", englishName: "Marathi", dir: "ltr", intl: "mr-IN", group: "asian" },
  { code: "gu", nativeName: "ગુજરાતી", englishName: "Gujarati", dir: "ltr", intl: "gu-IN", group: "asian" },
  { code: "kn", nativeName: "ಕನ್ನಡ", englishName: "Kannada", dir: "ltr", intl: "kn-IN", group: "asian" },
  { code: "ml", nativeName: "മലയാളം", englishName: "Malayalam", dir: "ltr", intl: "ml-IN", group: "asian" },
  { code: "ne", nativeName: "नेपाली", englishName: "Nepali", dir: "ltr", intl: "ne-NP", group: "asian" },
  { code: "si", nativeName: "සිංහල", englishName: "Sinhala", dir: "ltr", intl: "si-LK", group: "asian" },
  { code: "az", nativeName: "Azərbaycan", englishName: "Azerbaijani", dir: "ltr", intl: "az-AZ", group: "other" },
  { code: "kk", nativeName: "Қазақша", englishName: "Kazakh", dir: "ltr", intl: "kk-KZ", group: "other" },
  { code: "uz", nativeName: "Oʻzbekcha", englishName: "Uzbek", dir: "ltr", intl: "uz-UZ", group: "other" },
  { code: "hy", nativeName: "Հայերեն", englishName: "Armenian", dir: "ltr", intl: "hy-AM", group: "other" },
  { code: "ka", nativeName: "ქართული", englishName: "Georgian", dir: "ltr", intl: "ka-GE", group: "other" },
  { code: "is", nativeName: "Íslenska", englishName: "Icelandic", dir: "ltr", intl: "is-IS", group: "european" },
  { code: "ga", nativeName: "Gaeilge", englishName: "Irish", dir: "ltr", intl: "ga-IE", group: "european" },
  { code: "cy", nativeName: "Cymraeg", englishName: "Welsh", dir: "ltr", intl: "cy-GB", group: "european" },
  { code: "af", nativeName: "Afrikaans", englishName: "Afrikaans", dir: "ltr", intl: "af-ZA", group: "african" },
  { code: "am", nativeName: "አማርኛ", englishName: "Amharic", dir: "ltr", intl: "am-ET", group: "african" },
  { code: "km", nativeName: "ខ្មែរ", englishName: "Khmer", dir: "ltr", intl: "km-KH", group: "asian" },
  { code: "lo", nativeName: "ລາວ", englishName: "Lao", dir: "ltr", intl: "lo-LA", group: "asian" },
  { code: "my", nativeName: "မြန်မာ", englishName: "Burmese", dir: "ltr", intl: "my-MM", group: "asian" },
  { code: "mn", nativeName: "Монгол", englishName: "Mongolian", dir: "ltr", intl: "mn-MN", group: "asian" },
  { code: "bs", nativeName: "Bosanski", englishName: "Bosnian", dir: "ltr", intl: "bs-BA", group: "european" },
  { code: "mk", nativeName: "Македонски", englishName: "Macedonian", dir: "ltr", intl: "mk-MK", group: "european" },
  { code: "sq", nativeName: "Shqip", englishName: "Albanian", dir: "ltr", intl: "sq-AL", group: "european" },
  { code: "lt", nativeName: "Lietuvių", englishName: "Lithuanian", dir: "ltr", intl: "lt-LT", group: "european" },
  { code: "lv", nativeName: "Latviešu", englishName: "Latvian", dir: "ltr", intl: "lv-LV", group: "european" },
  { code: "et", nativeName: "Eesti", englishName: "Estonian", dir: "ltr", intl: "et-EE", group: "european" },
] as const satisfies readonly AppLocaleConfig[];

export type AppLocale = (typeof LOCALES)[number]["code"];

export const localeCodes = LOCALES.map((locale) => locale.code) as [
  AppLocale,
  ...AppLocale[],
];

export const defaultLocale: AppLocale = "en";

export const localeMap = Object.fromEntries(
  LOCALES.map((locale) => [locale.code, locale]),
) as Record<AppLocale, AppLocaleConfig>;

export const isAppLocale = (value: string): value is AppLocale =>
  Object.prototype.hasOwnProperty.call(localeMap, value);

export const isRtlLocale = (locale: string) =>
  isAppLocale(locale) ? localeMap[locale].dir === "rtl" : false;

export const getLocaleIntl = (locale: string) =>
  isAppLocale(locale) ? localeMap[locale].intl : "en-US";

export const getLocaleConfig = (locale: string) =>
  isAppLocale(locale) ? localeMap[locale] : localeMap.en;

export const arabicScriptLocales = new Set<AppLocale>(["ar", "fa", "ur"]);

export const sortedLocalesByNativeName = [...LOCALES].sort((a, b) =>
  a.nativeName.localeCompare(b.nativeName, "en", { sensitivity: "base" }),
);
