import { redirect } from "next/navigation";

// 旧 /menu 路由：跳转到单页的菜单区（保留旧链接可用性）
export default function MenuPage() {
  redirect("/#menu");
}
