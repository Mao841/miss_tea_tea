import { createBrowserClient } from "@supabase/ssr";

// 浏览器端客户端（登录表单等客户端组件使用），会话存于 Cookie
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "缺少 Supabase 环境变量（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY），请在 .env.local 或 Vercel 环境变量中配置"
    );
  }
  return createBrowserClient(url, anonKey);
}
