#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.join(__dirname, ".i18n-cache");
const chunkDir = path.join(cacheDir, "_llm-chunks");

const english = JSON.parse(
  await fs.readFile(path.join(cacheDir, "_unique-en.json"), "utf8"),
);

const locales = ["nb", "da", "sr", "sk", "sl"];
const caches = Object.fromEntries(
  await Promise.all(
    locales.map(async (loc) => {
      try {
        const raw = await fs.readFile(path.join(cacheDir, `${loc}.json`), "utf8");
        return [loc, JSON.parse(raw)];
      } catch {
        return [loc, {}];
      }
    }),
  ),
);

const files = (await fs.readdir(chunkDir))
  .filter((f) => /^chunk-\d+\.json$/.test(f))
  .sort();

for (const file of files) {
  const chunk = JSON.parse(await fs.readFile(path.join(chunkDir, file), "utf8"));
  for (const loc of locales) {
    if (!chunk[loc]) continue;
    Object.assign(caches[loc], chunk[loc]);
  }
  console.log(`merged ${file}`);
}

for (const loc of locales) {
  const ordered = {};
  for (const k of english) {
    if (caches[loc][k] !== undefined) ordered[k] = caches[loc][k];
    else if (k === "SellPoint") ordered[k] = "SellPoint";
    else if (k === "—") ordered[k] = "—";
  }
  await fs.writeFile(
    path.join(cacheDir, `${loc}.json`),
    `${JSON.stringify(ordered, null, 2)}\n`,
  );
}

const isAlpha = (k, v) => /[A-Za-z]{2,}/.test(k) && (v === undefined || v === k);
for (const loc of locales) {
  const cache = JSON.parse(
    await fs.readFile(path.join(cacheDir, `${loc}.json`), "utf8"),
  );
  const translated = english.filter((k) => cache[k] && cache[k] !== k).length;
  const identity = english.filter((k) => isAlpha(k, cache[k])).length;
  const missing = english.filter((k) => cache[k] === undefined).length;
  console.log(
    `${loc}: ${translated}/${english.length} (${((translated / english.length) * 100).toFixed(1)}%) identity=${identity} missing=${missing}`,
  );
}
