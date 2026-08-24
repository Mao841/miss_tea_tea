import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "qqnptmvafegkxzlqnfaq.supabase.co" },
    ],
  },
};

export default nextConfig;
