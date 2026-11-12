#!/usr/bin/env node
/**
 * Generates locale message JSON from en.json via MyMemory (+ gtx fallback).
 * Resumes from scripts/.i18n-cache/. Skips locales already >= MIN_COVERAGE.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const messagesDir = path.join(root, "messages");
const cacheDir = path.join(__dirname, ".i18n-cache");

const LOCALES = [
  "es","fr","de","zh-CN","zh-TW","ja","ko","pt","pt-BR","ru","tr","it","nl","hi","ur","id","ms","bn","fa","th","vi","pl","uk","sv","nb","da","fi","el","he","ro","cs","hu","bg","hr","sr","sk","sl","sw","fil","ta","te","mr","gu","kn","ml","ne","si","az","kk","uz","hy","ka","is","ga","cy","af","am","km","lo","my","mn","bs","mk","sq","lt","lv","et",
];

const TRANSLATE_MAP = {
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  "pt-BR": "pt-BR",
  nb: "no",
  fil: "tl",
  he: "he",
};

const BATCH_SIZE = 8;
const CONCURRENCY = Number(process.env.CONCURRENCY || 2);
const MIN_COVERAGE = Number(process.env.MIN_COVERAGE || 0.95);
const EMAIL = process.env.MYMEMORY_EMAIL || "";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const flatten = (obj, prefix = "", out = new Map()) => {
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, next, out);
    } else out.set(next, value);
  }
  return out;
};

const unflatten = (entries) => {
  const result = {};
  for (const [key, value] of entries) {
    const parts = key.split(".");
    let cursor = result;
    for (let i = 0; i < parts.length - 1; i += 1) {
      cursor[parts[i]] ??= {};
      cursor = cursor[parts[i]];
    }
    cursor[parts[parts.length - 1]] = value;
  }
  return result;
};

const protect = (text) => {
  const tokens = [];
  const protectedText = String(text).replace(
    /(\{[^}]+\})|(SellPoint)|(%[sd])/g,
    (match) => {
      const id = `⟦${tokens.length}⟧`;
      tokens.push(match);
      return id;
    },
  );
  return { protectedText, tokens };
};

const restore = (text, tokens) =>
  String(text).replace(/⟦\s*(\d+)\s*⟧/g, (_, index) => tokens[Number(index)] ?? "");

const translateMyMemory = async (text, target) => {
  const tl = TRANSLATE_MAP[target] ?? target;
  const { protectedText, tokens } = protect(text);
  const params = new URLSearchParams({
    q: protectedText,
    langpair: `en|${tl}`,
  });
  if (EMAIL) params.set("de", EMAIL);
  const response = await fetch(
    `https://api.mymemory.translated.net/get?${params.toString()}`,
  );
  if (!response.ok) {
    throw Object.assign(new Error(`mymemory ${response.status}`), {
      status: response.status,
    });
  }
  const data = await response.json();
  if (data?.responseStatus && Number(data.responseStatus) !== 200) {
    throw Object.assign(new Error(`mymemory status ${data.responseStatus}`), {
      status: Number(data.responseStatus),
    });
  }
  const translated = data?.responseData?.translatedText;
  if (!translated || /MYMEMORY WARNING/i.test(translated)) {
    throw new Error(translated || "empty translation");
  }
  return restore(translated, tokens);
};

const translateGtx = async (text, target) => {
  const tl = TRANSLATE_MAP[target] ?? target;
  const { protectedText, tokens } = protect(text);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(protectedText)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw Object.assign(new Error(`gtx ${response.status}`), {
      status: response.status,
    });
  }
  const data = await response.json();
  const translated = Array.isArray(data?.[0])
    ? data[0].map((part) => part?.[0] ?? "").join("")
    : protectedText;
  return restore(translated, tokens);
};

const translateOne = async (text, target) => {
  try {
    return await translateMyMemory(text, target);
  } catch {
    return translateGtx(text, target);
  }
};

const loadCache = async (locale) => {
  try {
    const raw = await fs.readFile(path.join(cacheDir, `${locale}.json`), "utf8");
    return new Map(Object.entries(JSON.parse(raw)));
  } catch {
    return new Map();
  }
};

const saveCache = async (locale, cache) => {
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(
    path.join(cacheDir, `${locale}.json`),
    JSON.stringify(Object.fromEntries(cache), null, 2),
  );
};

const english = JSON.parse(
  await fs.readFile(path.join(messagesDir, "en.json"), "utf8"),
);
const flatEn = flatten(english);
const uniqueValues = [
  ...new Set([...flatEn.values()].filter((v) => typeof v === "string")),
];

const only = process.argv.slice(2);
const targets = only.length ? LOCALES.filter((l) => only.includes(l)) : LOCALES;

const cleanCache = (cache) => {
  const cleaned = new Map(cache);
  for (const [k, v] of [...cleaned.entries()]) {
    if (k === v && /[A-Za-z]{4,}/.test(k)) cleaned.delete(k);
  }
  return cleaned;
};

const coverageOf = (cache) => {
  const cleaned = cleanCache(cache);
  const missing = uniqueValues.filter((value) => !cleaned.has(value)).length;
  return {
    cleaned,
    missing,
    ratio: (uniqueValues.length - missing) / uniqueValues.length,
  };
};

console.log(
  `Generating up to ${targets.length} locales from ${uniqueValues.length} unique strings (concurrency=${CONCURRENCY})`,
);

const writeLocaleFile = async (locale, cleaned) => {
  const localizedEntries = [...flatEn.entries()].map(([key, value]) => [
    key,
    typeof value === "string" ? (cleaned.get(value) ?? value) : value,
  ]);
  await fs.writeFile(
    path.join(messagesDir, `${locale}.json`),
    `${JSON.stringify(unflatten(localizedEntries), null, 2)}\n`,
  );
};

const generateLocale = async (locale) => {
  const cache = await loadCache(locale);
  let { cleaned, missing, ratio } = coverageOf(cache);
  if (ratio >= MIN_COVERAGE) {
    await writeLocaleFile(locale, cleaned);
    console.log(`[${locale}] skip (coverage=${(ratio * 100).toFixed(1)}%)`);
    return;
  }

  console.log(`[${locale}] missing ${missing}`);
  const pending = uniqueValues.filter((value) => !cleaned.has(value));

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    for (const src of batch) {
      let attempts = 0;
      while (attempts < 5) {
        try {
          cleaned.set(src, await translateOne(src, locale));
          await sleep(120);
          break;
        } catch (error) {
          attempts += 1;
          const wait = Math.min(30000, 1000 * 2 ** attempts);
          console.warn(
            `[${locale}] fail (${attempts}) "${src.slice(0, 32)}": ${error.message}; wait ${wait}ms`,
          );
          await sleep(wait);
        }
      }
    }
    await saveCache(locale, cleaned);
  }

  ({ missing, ratio } = coverageOf(cleaned));
  await writeLocaleFile(locale, cleaned);
  console.log(
    `[${locale}] wrote messages/${locale}.json (coverage=${(ratio * 100).toFixed(1)}%, missing=${missing})`,
  );
};

const queue = [...targets];
const workers = Array.from(
  { length: Math.min(CONCURRENCY, queue.length) },
  async () => {
    while (queue.length) {
      const locale = queue.shift();
      if (!locale) break;
      await generateLocale(locale);
      await sleep(250);
    }
  },
);

await Promise.all(workers);
console.log("Done.");
