/**
 * Shared browser security headers and nonce-based CSP for Next.js.
 * Keep directives aligned with next/font self-hosting, same-origin /api proxy,
 * /uploads rewrite, next-themes, MUI/Emotion inline styles, and data: image previews.
 */

export const SECURITY_HEADER_VALUES = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "X-DNS-Prefetch-Control": "off",
} as const;

const HSTS_VALUE = "max-age=15552000";

export const buildContentSecurityPolicy = (nonce: string) => {
  const isDev = process.env.NODE_ENV === "development";

  // style-src keeps 'unsafe-inline' for MUI Emotion / CSS-in-JS that cannot receive nonces.
  // script-src uses nonce + strict-dynamic (Next.js applies the nonce to framework scripts).
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "manifest-src 'self'",
  ];

  if (!isDev) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
};

export const applySecurityHeaders = (
  headers: Headers,
  options?: { csp?: string; includeHsts?: boolean },
) => {
  for (const [key, value] of Object.entries(SECURITY_HEADER_VALUES)) {
    headers.set(key, value);
  }

  if (options?.csp) {
    headers.set("Content-Security-Policy", options.csp);
  }

  const includeHsts =
    options?.includeHsts ??
    (process.env.NODE_ENV === "production" && process.env.DISABLE_HSTS !== "1");
  if (includeHsts) {
    headers.set("Strict-Transport-Security", HSTS_VALUE);
  }
};

export const nextConfigSecurityHeaders = (): Array<{ key: string; value: string }> => {
  const headers: Array<{ key: string; value: string }> = Object.entries(
    SECURITY_HEADER_VALUES,
  ).map(([key, value]) => ({
    key,
    value,
  }));

  if (process.env.NODE_ENV === "production" && process.env.DISABLE_HSTS !== "1") {
    headers.push({
      key: "Strict-Transport-Security",
      value: HSTS_VALUE,
    });
  }

  return headers;
};
