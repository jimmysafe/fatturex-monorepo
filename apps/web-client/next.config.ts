import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "t9eyk6clyuy8air6.public.blob.vercel-storage.com" }],
  },
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
