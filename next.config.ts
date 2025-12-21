import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "calm-alpaca-98.convex.cloud",
        port: "",
      },
    ],
  },
};

export default nextConfig;
