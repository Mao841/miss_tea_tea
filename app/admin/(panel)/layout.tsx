import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 保护 /admin 及子页面：未登录一律跳转登录页
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }
  return <>{children}</>;
}
