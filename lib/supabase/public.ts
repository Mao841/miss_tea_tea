import { createClient } from "@supabase/supabase-js";

// 前台公开数据读取（RLS 只读），供服务端组件使用
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "缺少 Supabase 环境变量（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY），请在 .env.local 或 Vercel 环境变量中配置"
    );
  }
  return createClient(url, anonKey);
}
