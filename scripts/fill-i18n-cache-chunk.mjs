#!/usr/bin/env node
/**
 * Fill missing/identity entries in .i18n-cache for selected locales.
 * Uses MyMemory + gtx fallback; writes every CHUNK_SIZE keys.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.join(__dirname, ".i18n-cache");

const LOCALES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["hi", "vi", "th", "ru", "uk"];

const CHUNK_SIZE = 200;
const BATCH_SIZE = 8;
const EMAIL = process.env.MYMEMORY_EMAIL || "";

const TRANSLATE_MAP = {
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  "pt-BR": "pt-BR",
  nb: "no",
  fil: "tl",
  he: "he",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const letterCount = (s) => [...String(s)].filter((c) => /\p{L}/u.test(c)).length;

const needsTranslation = (en, val) => {
  if (val === undefined || val === null || val === "") return true;
  if (val === en && letterCount(en) >= 4) return true;
  return false;
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
  if (!response.ok) throw new Error(`mymemory ${response.status}`);
  const data = await response.json();
  if (data?.responseStatus && Number(data.responseStatus) !== 200) {
    throw new Error(`mymemory status ${data.responseStatus}`);
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
  if (!response.ok) throw new Error(`gtx ${response.status}`);
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

const coverage = (enList, cache) => {
  let filled = 0;
  let missing = 0;
  let identity = 0;
  for (const key of enList) {
    const v = cache[key];
    if (v === undefined || v === null || v === "") missing++;
    else if (v === key && letterCount(key) >= 4) identity++;
    else filled++;
  }
  const total = enList.length;
  const translated = filled;
  const ratio = total ? translated / total : 1;
  return { total, filled, missing, identity, translated, ratio };
};

const loadJson = async (file) => {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveCache = async (locale, cache, enList) => {
  const ordered = {};
  for (const key of enList) {
    if (cache[key] !== undefined) ordered[key] = cache[key];
  }
  for (const [k, v] of Object.entries(cache)) {
    if (!(k in ordered)) ordered[k] = v;
  }
  await fs.writeFile(
    path.join(cacheDir, `${locale}.json`),
    `${JSON.stringify(ordered, null, 2)}\n`,
  );
};

const enList = JSON.parse(
  await fs.readFile(path.join(cacheDir, "_unique-en.json"), "utf8"),
);

const summarize = (locale, c) => {
  const pct = (c.ratio * 100).toFixed(1);
  const todo = c.missing + c.identity;
  console.log(
    `[${locale}] coverage=${pct}% (${c.translated}/${c.total}) | missing=${c.missing} identity=${c.identity} todo=${todo}`,
  );
};

for (const locale of LOCALES) {
  const cache = await loadJson(path.join(cacheDir, `${locale}.json`));
  const before = coverage(enList, cache);
  const pending = enList.filter((key) => needsTranslation(key, cache[key]));

  if (pending.length === 0) {
    summarize(locale, before);
    continue;
  }

  console.error(`[${locale}] translating ${pending.length} keys...`);

  let doneInChunk = 0;
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (src) => {
        let attempts = 0;
        while (attempts < 5) {
          try {
            cache[src] = await translateOne(src, locale);
            await sleep(80);
            break;
          } catch (error) {
            attempts += 1;
            if (attempts >= 5) {
              console.error(`[${locale}] give up "${src.slice(0, 40)}": ${error.message}`);
            } else {
              await sleep(Math.min(30000, 500 * 2 ** attempts));
            }
          }
        }
      }),
    );
    doneInChunk += batch.length;
    if (doneInChunk >= CHUNK_SIZE || i + BATCH_SIZE >= pending.length) {
      await saveCache(locale, cache, enList);
      const mid = coverage(enList, cache);
      console.error(
        `[${locale}] saved chunk (+${doneInChunk} this write) coverage=${(mid.ratio * 100).toFixed(1)}%`,
      );
      doneInChunk = 0;
    }
  }

  const after = coverage(enList, cache);
  summarize(locale, after);
}
