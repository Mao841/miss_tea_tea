import Link from "next/link";
import { logout } from "./actions";

const sections = [
  { href: "/admin/menu", emoji: "🍹", title: "菜单管理", desc: "增删改饮品、上下架、排序、分类" },
  { href: "/admin/announcements", emoji: "📢", title: "活动管理", desc: "发布、编辑、停用活动公告" },
  { href: "/admin/settings", emoji: "🏪", title: "店铺信息", desc: "地址、营业时间、Instagram、标语" },
];

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">欢迎，老板 👋</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-[#8b4513] underline">
            查看网站
          </Link>
          <form action={logout}>
            <button type="submit" className="text-red-600 underline">
              退出登录
            </button>
          </form>
        </div>
      </div>
      <div className="mt-6 grid gap-4">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex items-center gap-4 rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd] hover:shadow-lg"
          >
            <span className="text-3xl">{section.emoji}</span>
            <span>
              <span className="block font-bold">{section.title}</span>
              <span className="block text-sm text-[#8a7363]">{section.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
