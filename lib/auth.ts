import type { User } from "@supabase/supabase-js";

const OWNER_EMAIL = "maosy841@gmail.com";

// 老板判定：app_metadata.role = "owner"（可在 Supabase 后台给多账号设置），
// 或邮箱为老板邮箱。顾客/其他账号一律视为普通访客。
export function isOwner(user: User): boolean {
  return user.app_metadata?.role === "owner" || user.email === OWNER_EMAIL;
}
