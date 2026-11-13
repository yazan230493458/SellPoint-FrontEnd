import { type NextRequest, NextResponse } from "next/server";
import { resolveApiProxyTarget } from "@/lib/api-proxy-target";
import { applySecurityHeaders } from "@/lib/security-headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

const REQUEST_HEADER_ALLOW = new Set([
  "accept",
  "accept-language",
  "authorization",
  "content-type",
  "cookie",
  "origin",
  "user-agent",
  "x-forwarded-for",
  "x-locale",
  "x-payment-signature",
  "x-real-ip",
  "x-requested-with",
]);

const stripCookieDomain = (value: string) =>
  value
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part && !/^domain=/i.test(part))
    .join("; ");

const buildTargetUrl = (request: NextRequest, pathSegments: string[]) => {
  if (pathSegments.some((segment) => segment === ".." || segment.includes("\\"))) {
    throw new Error("Invalid proxy path");
  }
  const target = resolveApiProxyTarget();
  const path = pathSegments.map(encodeURIComponent).join("/");
  const url = new URL(`${target}/api/${path}`);
  url.search = request.nextUrl.search;
  return url;
};

const forwardRequestHeaders = (request: NextRequest) => {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower)) return;
    if (!REQUEST_HEADER_ALLOW.has(lower)) return;
    headers.set(key, value);
  });
  return headers;
};

const STRIP_UPSTREAM_HEADERS = new Set([
  "x-powered-by",
  "server",
  "x-aspnet-version",
  "x-aspnetmvc-version",
]);

const applyResponseHeaders = (upstream: Response, headers: Headers) => {
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower)) return;
    if (STRIP_UPSTREAM_HEADERS.has(lower)) return;
    if (lower === "set-cookie") return;
    if (lower === "content-encoding") return;
    headers.set(key, value);
  });

  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];

  for (const cookie of setCookies) {
    headers.append("set-cookie", stripCookieDomain(cookie));
  }
};

const proxyRequest = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) => {
  try {
    const { path } = await context.params;
    const segments = Array.isArray(path) ? path : [];
    if (segments.length === 0) {
      const notFound = NextResponse.json({ message: "Not found" }, { status: 404 });
      applySecurityHeaders(notFound.headers);
      return notFound;
    }

    const targetUrl = buildTargetUrl(request, segments);
    const method = request.method.toUpperCase();
    const headers = forwardRequestHeaders(request);
    const body =
      method === "GET" || method === "HEAD"
        ? undefined
        : await request.arrayBuffer();

    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    applyResponseHeaders(upstream, responseHeaders);
    applySecurityHeaders(responseHeaders);
    const payload = await upstream.arrayBuffer();

    return new NextResponse(payload, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    const failure = NextResponse.json({ message: "Bad gateway" }, { status: 502 });
    applySecurityHeaders(failure.headers);
    return failure;
  }
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
export const HEAD = proxyRequest;
