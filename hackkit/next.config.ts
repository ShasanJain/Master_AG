import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for Docker / Cloud Run deployments
  output: 'standalone',
  // trailingSlash: true,
  images: {
    // Required when output: 'export'
    // unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile pics
      },
    ],
  },
};

export default nextConfig;
