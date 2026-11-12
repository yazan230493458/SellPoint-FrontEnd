import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

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
        ],
    },
    experimental: {
        agentUpgrade: "security",
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
