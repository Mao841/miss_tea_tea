import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 后台写操作统一入口：校验登录态（RLS 兜底），未登录跳转登录页
export async function getAdminSupabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }
  return supabase;
}

export function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function num(formData: FormData, key: string): number | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}
