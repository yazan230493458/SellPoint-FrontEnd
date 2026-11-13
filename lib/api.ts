import { useUserStore } from "@/store/user.store";

const DEFAULT_DEV_BACKEND_ORIGIN = "http://localhost:1000";
const DEFAULT_PROD_BACKEND_ORIGIN = "https://sellpoint-backend-86i1.onrender.com";

const isLocalBackendOrigin = (value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

const normalizeOrigin = (value: string) => value.replace(/\/+$/, "");

/**
 * Browser API base path. Empty string = same-origin `/api/...` via the Next.js proxy.
 * Direct Backend origins are rejected in production so cookies stay first-party.
 */
const resolveApiUrl = () => {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configured || configured === "/") return "";

  const origin = normalizeOrigin(configured);
  if (process.env.NODE_ENV === "production") {
    if (isLocalBackendOrigin(origin) || origin === DEFAULT_PROD_BACKEND_ORIGIN) {
      return "";
    }
  }
  if (origin === DEFAULT_DEV_BACKEND_ORIGIN || isLocalBackendOrigin(origin)) {
    return "";
  }
  return origin;
};

/**
 * Backend origin for top-level OAuth navigations only (authorize + provider redirect).
 * Session cookies are established later via same-origin handoff through the proxy.
 */
const resolveOAuthBackendOrigin = () => {
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (configured) {
    const origin = normalizeOrigin(configured);
    if (process.env.NODE_ENV === "production" && isLocalBackendOrigin(origin)) {
      return DEFAULT_PROD_BACKEND_ORIGIN;
    }
    return origin;
  }
  return process.env.NODE_ENV === "production"
    ? DEFAULT_PROD_BACKEND_ORIGIN
    : DEFAULT_DEV_BACKEND_ORIGIN;
};

/** Same-origin API prefix for browser fetch (proxied to Express). */
export const API_URL = resolveApiUrl();

/** Absolute Backend origin used only for OAuth window navigations. */
export const OAUTH_BACKEND_URL = resolveOAuthBackendOrigin();

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  formData?: FormData;
  auth?: boolean;
};

const refreshSession = async () => {
  const response = await fetch(`${API_URL}/api/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) return false;
  const data = (await response.json()) as { user?: { role?: "USER" | "ADMIN" | "OWNER" | null; premium?: boolean } };
  const state = useUserStore.getState();
  state.setSession({
    role: data.user?.role ?? state.user?.role ?? null,
    premium: Boolean(data.user?.premium),
  });
  return true;
};

const resolveRequestLocale = () => {
  if (typeof document !== "undefined") {
    const htmlLang = document.documentElement.lang?.trim();
    if (htmlLang) return htmlLang;
  }
  if (typeof window !== "undefined") {
    const match = window.location.pathname.match(/^\/([^/]+)/);
    if (match?.[1]) return match[1];
  }
  return "en";
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const send = async () => {
    const headers = new Headers();
    headers.set("X-Locale", resolveRequestLocale());
    headers.set("Accept-Language", resolveRequestLocale());
    let body: BodyInit | undefined;
    if (options.formData) {
      body = options.formData;
    } else if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }
    return fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body,
      credentials: "include",
    });
  };

  let response = await send();
  if (response.status === 401 && options.auth !== false && path !== "/api/refresh" && path !== "/api/log-in" && path !== "/api/log-in/2fa") {
    const renewed = await refreshSession();
    if (renewed) response = await send();
  }

  const payload = (await response.json().catch(() => ({}))) as { message?: string };
  if (!response.ok) {
    throw new ApiError(response.status, payload.message ?? "Request failed");
  }
  return payload as T;
};

export const assetUrl = (value: string | null | undefined) => {
  if (!value) return "/placeholder.png";
  if (value.startsWith("data:")) return value;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const url = new URL(value);
      if (
        isLocalBackendOrigin(url.origin) ||
        url.hostname === "sellpoint-backend-86i1.onrender.com"
      ) {
        return `${url.pathname}${url.search}${url.hash}`;
      }
      return value;
    } catch {
      return value;
    }
  }

  if (value.startsWith("/uploads/")) return value;
  return value;
};
