import { useUserStore } from "@/store/user.store";

const DEFAULT_DEV_API_URL = "http://localhost:1000";
const DEFAULT_PROD_API_URL = "https://sellpoint-backend-86i1.onrender.com";

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
 * Single Backend origin for every API request, OAuth redirect, and /uploads asset.
 * Priority: NEXT_PUBLIC_API_URL → mode default.
 * Production never keeps a localhost/127.0.0.1 Backend origin.
 */
const resolveApiUrl = () => {
  const isProd = process.env.NODE_ENV === "production";
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configured) {
    const origin = normalizeOrigin(configured);
    if (isProd && isLocalBackendOrigin(origin)) {
      return DEFAULT_PROD_API_URL;
    }
    return origin;
  }

  return isProd ? DEFAULT_PROD_API_URL : DEFAULT_DEV_API_URL;
};

/** Backend origin used by all API and upload URL construction. */
export const API_URL = resolveApiUrl();

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
      if (isLocalBackendOrigin(url.origin)) {
        return `${API_URL}${url.pathname}${url.search}${url.hash}`;
      }
      return value;
    } catch {
      return value;
    }
  }

  if (value.startsWith("/uploads/")) return `${API_URL}${value}`;
  return value;
};
