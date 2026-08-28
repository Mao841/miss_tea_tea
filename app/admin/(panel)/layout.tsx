import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// 保护 /admin 及子页面：未登录跳登录页；非老板账号（如顾客）跳回主界面
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
  if (!isOwner(user)) {
    redirect("/");
  }
  return <div className="paper-bg min-h-screen">{children}</div>;
}
