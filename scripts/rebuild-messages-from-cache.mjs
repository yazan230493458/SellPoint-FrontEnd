#!/usr/bin/env node
/** Rebuild messages/{locale}.json from scripts/.i18n-cache/{locale}.json */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const messagesDir = path.join(root, "messages");
const cacheDir = path.join(__dirname, ".i18n-cache");

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

const english = JSON.parse(
  await fs.readFile(path.join(messagesDir, "en.json"), "utf8"),
);
const flatEn = flatten(english);
const unique = [
  ...new Set([...flatEn.values()].filter((v) => typeof v === "string")),
];

const files = (await fs.readdir(cacheDir)).filter(
  (f) => f.endsWith(".json") && !f.startsWith("_"),
);

for (const file of files) {
  const locale = file.replace(/\.json$/, "");
  const cache = new Map(
    Object.entries(
      JSON.parse(await fs.readFile(path.join(cacheDir, file), "utf8")),
    ),
  );
  for (const [k, v] of [...cache.entries()]) {
    if (k === v && /[A-Za-z]{4,}/.test(k)) cache.delete(k);
  }
  const missing = unique.filter((value) => !cache.has(value)).length;
  const localized = [...flatEn.entries()].map(([key, value]) => [
    key,
    typeof value === "string" ? (cache.get(value) ?? value) : value,
  ]);
  await fs.writeFile(
    path.join(messagesDir, `${locale}.json`),
    `${JSON.stringify(unflatten(localized), null, 2)}\n`,
  );
  const ratio = ((unique.length - missing) / unique.length) * 100;
  console.log(
    `${locale}: coverage ${ratio.toFixed(1)}% missing ${missing}`,
  );
}
