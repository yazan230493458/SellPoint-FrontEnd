/**
 * Server-only Backend origin for the same-origin API proxy.
 * Never import this into Client Components.
 */

const DEFAULT_DEV_TARGET = "http://localhost:1000";
const DEFAULT_PROD_TARGET = "https://sellpoint-backend-86i1.onrender.com";

const ALLOWED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "sellpoint-backend-86i1.onrender.com",
]);

const normalizeOrigin = (value: string) => value.replace(/\/+$/, "");

export const resolveApiProxyTarget = () => {
  const configured = (
    process.env.API_PROXY_TARGET?.trim() ||
    process.env.BACKEND_URL?.trim() ||
    ""
  );
  const fallback =
    process.env.NODE_ENV === "production" ? DEFAULT_PROD_TARGET : DEFAULT_DEV_TARGET;
  const origin = normalizeOrigin(configured || fallback);

  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error("API proxy target is not a valid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("API proxy target must use http or https");
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error("API proxy target host is not allowlisted");
  }

  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("API proxy target must use https in production");
  }

  return normalizeOrigin(parsed.origin);
};
