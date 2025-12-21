import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "earnest-bat-232.convex.cloud",
        port: "",
      },
    ],
  },
};

export default nextConfig;
