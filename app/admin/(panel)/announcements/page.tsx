import Link from "next/link";
import { getSupabase } from "@/lib/supabase/public";
import type { AnnouncementRow } from "@/lib/types";
import { deleteAnnouncement, toggleAnnouncement } from "./actions";

const btnOutline =
  "rounded-full border border-[#8b4513] px-3 py-1 text-xs text-[#8b4513] hover:bg-[#8b4513] hover:text-white";
const btnDanger =
  "rounded-full border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-600 hover:text-white";

export default async function AdminAnnouncementsPage() {
  const supabase = getSupabase();
  const { data: rows } = await supabase
    .from("announcements")
    .select("*")
    .order("sort_order");
  const announcements = (rows ?? []) as AnnouncementRow[];

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-[#8b4513] underline">
            ← 返回后台首页
          </Link>
          <h1 className="mt-2 text-2xl font-bold">📢 活动管理</h1>
        </div>
        <Link
          href="/admin/announcements/new"
          className="rounded-full bg-[#8b4513] px-5 py-2.5 text-white no-underline hover:bg-[#7a3d11]"
        >
          ＋ 新增活动
        </Link>
      </div>

      <section className="mt-6 space-y-4">
        {announcements.length === 0 && (
          <div className="rounded-[20px] bg-white p-8 text-center text-[#8a7363] shadow-[0_5px_15px_#ddd]">
            还没有活动，点右上角「＋ 新增活动」发布第一个吧
          </div>
        )}
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]"
          >
            <div className="flex flex-wrap items-center gap-3">
              <p className="min-w-0 flex-1 font-bold">
                {announcement.title_en}{" "}
                <span className="text-sm font-normal text-[#8a7363]">
                  {announcement.title_zh}
                </span>
              </p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs ${
                  announcement.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {announcement.is_active ? "进行中" : "已停用"}
              </span>
            </div>
            {announcement.body_en && (
              <p className="mt-2 text-sm text-[#8a7363]">
                {announcement.body_en}
                {announcement.body_zh ? ` / ${announcement.body_zh}` : ""}
              </p>
            )}
            <div className="mt-4 flex items-center gap-2">
              <form action={toggleAnnouncement}>
                <input type="hidden" name="id" value={announcement.id} />
                <input type="hidden" name="is_active" value={String(announcement.is_active)} />
                <button className={btnOutline}>
                  {announcement.is_active ? "停用" : "启用"}
                </button>
              </form>
              <Link
                href={`/admin/announcements/${announcement.id}/edit`}
                className={btnOutline}
              >
                编辑
              </Link>
              <form action={deleteAnnouncement} className="flex items-center gap-1">
                <input type="hidden" name="id" value={announcement.id} />
                <label className="flex items-center gap-1 text-xs text-[#8a7363]">
                  <input type="checkbox" required /> 确认
                </label>
                <button className={btnDanger}>删除</button>
              </form>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
