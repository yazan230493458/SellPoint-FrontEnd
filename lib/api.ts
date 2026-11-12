import { useUserStore } from "@/store/user.store";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1000";

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
  if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.startsWith("/uploads/")) return `${API_URL}${value}`;
  return value;
};
