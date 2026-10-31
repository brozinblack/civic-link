import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { unoptimized: true },
  experimental: { optimizePackageImports: ["lucide-react"] },
};

export default nextConfig;
