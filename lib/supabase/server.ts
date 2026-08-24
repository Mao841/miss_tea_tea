import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 服务端客户端（受保护页面、Server Action 使用），通过 Cookie 维持会话
export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "缺少 Supabase 环境变量（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY），请在 .env.local 或 Vercel 环境变量中配置"
    );
  }
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // 服务端组件中无法写 Cookie 时静默忽略（Server Action / Route Handler 中可正常写入）
        }
      },
    },
  });
}
