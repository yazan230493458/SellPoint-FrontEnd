import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const DEFAULT_DEV_TARGET = "http://localhost:1000";
const DEFAULT_PROD_TARGET = "https://sellpoint-backend-86i1.onrender.com";

const resolveUploadProxyTarget = () => {
  const configured = (
    process.env.API_PROXY_TARGET?.trim() ||
    process.env.BACKEND_URL?.trim() ||
    ""
  ).replace(/\/+$/, "");
  if (configured) return configured;
  return process.env.NODE_ENV === "production"
    ? DEFAULT_PROD_TARGET
    : DEFAULT_DEV_TARGET;
};

const uploadTarget = resolveUploadProxyTarget();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.248", "172.20.10.8"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "1000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "sellpoint-backend-86i1.onrender.com",
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${uploadTarget}/uploads/:path*`,
      },
    ];
  },
  experimental: {
    agentUpgrade: "security",
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
