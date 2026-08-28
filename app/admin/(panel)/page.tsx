import Link from "next/link";
import { logout } from "./actions";

const sections = [
  { href: "/admin/menu", emoji: "🍹", title: "菜单管理", desc: "增删改饮品、上下架、排序、分类" },
  { href: "/admin/announcements", emoji: "📢", title: "公告管理（NEWS）", desc: "发布公告后，首页女孩头顶出现气泡提示" },
  { href: "/admin/about", emoji: "🏠", title: "About 管理", desc: "文字 + 图片板块，可添加多条" },
  { href: "/admin/gallery", emoji: "🖼️", title: "Gallery 管理", desc: "照片墙：上传图片与说明" },
  { href: "/admin/settings", emoji: "🏪", title: "店铺信息（Contact）", desc: "地址、营业时间、电话、Instagram、标语" },
  { href: "/admin/messages", emoji: "💬", title: "顾客留言", desc: "查看顾客从网站发来的文字与图片留言" },
];

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">欢迎，老板 👋</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-[#8b4513] underline">
            查看网站
          </Link>
          <form action={logout}>
            <button type="submit" className="cursor-pointer text-red-600 underline">
              退出登录
            </button>
          </form>
        </div>
      </div>
      <p className="font-cn mt-1 text-sm text-[#8a7363]">
        在网站左上角双击商标即可回到这里
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex items-center gap-4 rounded-[20px] border-2 border-[#eed9c4] bg-white p-5 shadow-[0_5px_15px_#d8bda6] transition-shadow hover:shadow-lg"
          >
            <span className="text-3xl">{section.emoji}</span>
            <span>
              <span className="font-display block font-bold">{section.title}</span>
              <span className="font-cn block text-sm text-[#8a7363]">{section.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
