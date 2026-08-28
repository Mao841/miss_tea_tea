import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server Action 请求体上限：单张图片应用层限制 5MB（lib/images.ts），
  // About 支持一次多选多张（最多约 4-5 张），这里放宽到 25MB，
  // 确保任何“单张≤5MB”的组合都不会被框架层拦截，超限走应用层的友好提示。
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "qqnptmvafegkxzlqnfaq.supabase.co" },
    ],
  },
};

export default nextConfig;
