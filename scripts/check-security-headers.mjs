import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "lib/security-headers.ts"), "utf8");
const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
const proxySource = readFileSync(join(root, "proxy.ts"), "utf8");
const layoutSource = readFileSync(join(root, "app/[locale]/layout.tsx"), "utf8");

assert.match(source, /X-Frame-Options.*DENY/);
assert.match(source, /X-Content-Type-Options.*nosniff/);
assert.match(source, /frame-ancestors 'none'/);
assert.match(source, /script-src 'self' 'nonce-\$\{nonce\}' 'strict-dynamic'/);
assert.match(source, /object-src 'none'/);
assert.doesNotMatch(source, /script-src[^;\n]*'unsafe-inline'/);

assert.match(nextConfig, /poweredByHeader:\s*false/);
assert.match(nextConfig, /nextConfigSecurityHeaders/);

assert.match(proxySource, /buildContentSecurityPolicy/);
assert.match(proxySource, /x-nonce/);
assert.match(proxySource, /applySecurityHeaders/);

assert.match(layoutSource, /headers\(\)/);
assert.match(layoutSource, /nonce=\{nonce\}/);

console.log("security-headers static checks passed");
