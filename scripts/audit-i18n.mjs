#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const messagesDir = path.join(root, "messages");

const flatten = (obj, prefix = "", out = []) => {
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, next, out);
    } else {
      out.push([next, value]);
    }
  }
  return out;
};

const expected = [
  "en","ar","es","fr","de","zh-CN","zh-TW","ja","ko","pt","pt-BR","ru","tr","it","nl","hi","ur","id","ms","bn","fa","th","vi","pl","uk","sv","nb","da","fi","el","he","ro","cs","hu","bg","hr","sr","sk","sl","sw","fil","ta","te","mr","gu","kn","ml","ne","si","az","kk","uz","hy","ka","is","ga","cy","af","am","km","lo","my","mn","bs","mk","sq","lt","lv","et",
];

const files = (await fs.readdir(messagesDir)).filter((f) => f.endsWith(".json"));
const present = files.map((f) => f.replace(/\.json$/, ""));
const english = JSON.parse(await fs.readFile(path.join(messagesDir, "en.json"), "utf8"));
const enKeys = new Set(flatten(english).map(([k]) => k));

const missingFiles = expected.filter((code) => !present.includes(code));
const extras = present.filter((code) => !expected.includes(code));

const incomplete = [];
for (const code of present) {
  if (code === "en") continue;
  const data = JSON.parse(await fs.readFile(path.join(messagesDir, `${code}.json`), "utf8"));
  const keys = new Set(flatten(data).map(([k]) => k));
  const missingKeys = [...enKeys].filter((k) => !keys.has(k));
  const sameAsEn = flatten(data).filter(
    ([k, v]) => typeof v === "string" && english && flatten(english).find(([ek]) => ek === k)?.[1] === v && /[A-Za-z]{3,}/.test(v),
  ).length;
  if (missingKeys.length || sameAsEn > enKeys.size * 0.85) {
    incomplete.push({
      code,
      missingKeys: missingKeys.length,
      likelyUntranslated: sameAsEn,
    });
  }
}

console.log(JSON.stringify({
  expected: expected.length,
  present: present.length,
  missingFiles,
  extras,
  incomplete: incomplete.slice(0, 20),
  incompleteCount: incomplete.length,
}, null, 2));
