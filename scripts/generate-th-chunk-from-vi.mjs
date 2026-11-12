#!/usr/bin/env node
/** Build th-N.json from vi chunk JSON where keys overlap, listing gaps. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const chunks = path.join(__dirname, ".i18n-cache/chunks");

const viParts = ["vi-0", "vi-1", "vi-2", "vi-3", "vi-fix"].flatMap((name) => {
  const file = path.join(chunks, `${name}.json`);
  return fs.existsSync(file) ? [JSON.parse(fs.readFileSync(file, "utf8"))] : [];
});
const viMap = Object.assign({}, ...viParts);

const thKeys = JSON.parse(fs.readFileSync(`/tmp/th-${process.argv[2]}.keys.json`, "utf8"));
const out = {};
const missing = [];
for (const k of thKeys) {
  if (viMap[k] && viMap[k] !== k) out[k] = viMap[k];
  else missing.push(k);
}
const outFile = path.join(chunks, `th-${process.argv[2]}-vi-stub.json`);
fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
console.log(`wrote ${Object.keys(out).length} stub entries, missing ${missing.length}`);
if (missing.length) fs.writeFileSync(`/tmp/th-${process.argv[2]}.missing.json`, JSON.stringify(missing, null, 2));
