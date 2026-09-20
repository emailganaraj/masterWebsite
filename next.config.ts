import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output requires symlink privileges — enabled only in Docker/Linux builds
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
  serverExternalPackages: ["pg-boss"],
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "media.myarticlewebsite.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/api/media/local/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
