import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server Action 请求体默认只允许 1MB，手机上传的原图常超限导致 500。
  // 这里放宽到 6MB，并刻意大于 lib/images.ts 里 5MB 的应用层上限，
  // 让超 5MB 的图走应用层的友好提示（"图片不能超过 5MB"）而不是框架层直接崩溃。
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "qqnptmvafegkxzlqnfaq.supabase.co" },
    ],
  },
};

export default nextConfig;
