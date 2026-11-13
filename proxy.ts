import { type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import {
  applySecurityHeaders,
  buildContentSecurityPolicy,
} from "./lib/security-headers";

const handleI18n = createMiddleware(routing);

const proxy = (request: NextRequest) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildContentSecurityPolicy(nonce);

  // next-intl forwards request.headers into NextResponse.next({ request: { headers } }).
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy", csp);

  const response = handleI18n(request);
  applySecurityHeaders(response.headers, { csp });
  return response;
};

export default proxy;

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
