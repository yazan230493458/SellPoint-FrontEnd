#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.join(__dirname, ".i18n-cache");

const [locale, ...chunkFiles] = process.argv.slice(2);
if (!locale || !chunkFiles.length) {
  console.error("Usage: merge-i18n-chunk.mjs <locale> <chunk.json>...");
  process.exit(1);
}

const enList = JSON.parse(
  fs.readFileSync(path.join(cacheDir, "_unique-en.json"), "utf8"),
);
const cachePath = path.join(cacheDir, `${locale}.json`);
const cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));

for (const file of chunkFiles) {
  const chunk = JSON.parse(fs.readFileSync(file, "utf8"));
  Object.assign(cache, chunk);
}

const ordered = {};
for (const key of enList) {
  if (cache[key] !== undefined) ordered[key] = cache[key];
}
for (const [k, v] of Object.entries(cache)) {
  if (!(k in ordered)) ordered[k] = v;
}

fs.writeFileSync(cachePath, `${JSON.stringify(ordered, null, 2)}\n`);

const letterCount = (s) => [...String(s)].filter((c) => /\p{L}/u.test(c)).length;
let filled = 0,
  missing = 0,
  identity = 0;
for (const key of enList) {
  const v = ordered[key];
  if (v === undefined || v === null || v === "") missing++;
  else if (v === key && letterCount(key) >= 4) identity++;
  else filled++;
}
const pct = ((filled / enList.length) * 100).toFixed(1);
console.log(
  `[${locale}] coverage=${pct}% (${filled}/${enList.length}) missing=${missing} identity=${identity}`,
);
