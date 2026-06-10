import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Firebase Hosting static export — uncomment on deploy day:
  // output: 'export',
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
