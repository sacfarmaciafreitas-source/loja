import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return [{ source: "/feed.xml", destination: "/api/feed" }];
  },
};

export default nextConfig;
