#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.join(__dirname, ".i18n-cache");

const LOCALES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["pl", "he", "th"];

const CHUNK_SIZE = 200;
const SLEEP_MS = 100;

const TRANSLATE_MAP = { he: "he" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

const translateMyMemory = async (text, target) => {
  const tl = TRANSLATE_MAP[target] ?? target;
  const { protectedText, tokens } = protect(text);
  const params = new URLSearchParams({ q: protectedText, langpair: `en|${tl}` });
  const response = await fetch(
    `https://api.mymemory.translated.net/get?${params.toString()}`,
  );
  if (!response.ok) throw new Error(`mymemory ${response.status}`);
  const data = await response.json();
  const translated = data?.responseData?.translatedText;
  if (!translated || /MYMEMORY WARNING/i.test(translated)) {
    throw new Error(translated || "empty");
  }
  return restore(translated, tokens);
};

const translateOne = async (text, target) => {
  try {
    return await translateMyMemory(text, target);
  } catch {
    return translateGtx(text, target);
  }
};

const hasAlphabetic = (s) => /[a-zA-Z]/.test(s);

const isDoneTranslation = (english, translated) => {
  if (translated === undefined || translated === null) return false;
  if (translated !== english) return true;
  if (!hasAlphabetic(english)) return true;
  return false;
};

const loadObject = async (file) => {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return {};
  }
};

const countTranslated = (englishKeys, cache) => {
  let translatedCount = 0;
  for (const k of englishKeys) {
    const v = cache[k] ?? k;
    if (v !== k || !hasAlphabetic(k)) translatedCount++;
  }
  return translatedCount;
};

const english = JSON.parse(
  await fs.readFile(path.join(cacheDir, "_unique-en.json"), "utf8"),
);
const total = english.length;

for (const locale of LOCALES) {
  const cachePath = path.join(cacheDir, `${locale}.json`);
  const cache = await loadObject(cachePath);

  const pending = english.filter((src) => {
    const existing = cache[src];
    return !isDoneTranslation(src, existing);
  });

  console.error(`[${locale}] pending ${pending.length}/${total}`);

  for (let i = 0; i < pending.length; i += 1) {
    const src = pending[i];
    let attempts = 0;
    while (attempts < 6) {
      try {
        cache[src] = await translateOne(src, locale);
        await sleep(SLEEP_MS);
        break;
      } catch (e) {
        attempts++;
        await sleep(Math.min(15000, 500 * 2 ** attempts));
        if (attempts >= 6) {
          console.error(`[${locale}] give up: ${src.slice(0, 40)}`);
          cache[src] = src;
        }
      }
    }
    if ((i + 1) % CHUNK_SIZE === 0 || i === pending.length - 1) {
      const ordered = {};
      for (const k of english) ordered[k] = cache[k] ?? k;
      await fs.writeFile(cachePath, `${JSON.stringify(ordered, null, 2)}\n`);
      console.error(`[${locale}] saved chunk at ${i + 1}/${pending.length}`);
    }
  }

  const ordered = {};
  for (const k of english) ordered[k] = cache[k] ?? k;
  await fs.writeFile(cachePath, `${JSON.stringify(ordered, null, 2)}\n`);

  const translatedCount = countTranslated(english, ordered);
  console.log(`${locale}, ${translatedCount}, ${total}`);
}
