import Link from "next/link";
import { getSupabase } from "@/lib/supabase/public";
import type { AnnouncementRow } from "@/lib/types";
import AnnouncementManager from "@/components/admin/AnnouncementManager";
import Toast, { DONE_TEXT } from "@/components/admin/Toast";

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  const { done } = await searchParams;
  const supabase = getSupabase();
  const { data: rows } = await supabase
    .from("announcements")
    .select("*")
    .order("sort_order");
  const announcements = (rows ?? []) as AnnouncementRow[];

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      {done && <Toast text={DONE_TEXT[done] ?? "已完成 ✓"} />}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-[#8b4513] underline">
            ← 返回后台首页
          </Link>
          <h1 className="font-display mt-2 text-2xl font-bold">📢 公告管理（NEWS）</h1>
        </div>
        <Link
          href="/admin/announcements/new"
          className="rounded-full bg-[#8b4513] px-5 py-2.5 text-white no-underline hover:bg-[#7a3d11]"
        >
          ＋ 发布公告
        </Link>
      </div>

      {announcements.length === 0 ? (
        <div className="mt-6 rounded-[20px] bg-white p-8 text-center text-[#8a7363] shadow-[0_5px_15px_#ddd]">
          还没有公告。发布后，首页女孩头顶会出现「Here is a NEWS!」气泡。
        </div>
      ) : (
        <AnnouncementManager announcements={announcements} />
      )}
    </div>
  );
}
