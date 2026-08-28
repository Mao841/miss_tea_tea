import Link from "next/link";
import { getSupabase } from "@/lib/supabase/public";
import type { AboutEntryRow, AboutImageRow } from "@/lib/types";
import AboutManager from "@/components/admin/AboutManager";
import Toast, { DONE_TEXT } from "@/components/admin/Toast";

export default async function AdminAboutPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  const { done } = await searchParams;
  const supabase = getSupabase();
  const [{ data: rows }, { data: imageRows }] = await Promise.all([
    supabase.from("about_entries").select("*").order("sort_order"),
    supabase.from("about_images").select("*").order("sort_order"),
  ]);
  const entries = (rows ?? []) as AboutEntryRow[];
  const images = (imageRows ?? []) as AboutImageRow[];
  const entry = entries[0];

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      {done && <Toast text={DONE_TEXT[done] ?? "已完成 ✓"} />}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-[#8b4513] underline">
            ← 返回后台首页
          </Link>
          <h1 className="font-display mt-2 text-2xl font-bold">🏠 About 管理</h1>
        </div>
        {!entry && (
          <Link
            href="/admin/about/new"
            className="rounded-full bg-[#8b4513] px-5 py-2.5 text-white no-underline hover:bg-[#7a3d11]"
          >
            ＋ 创建 About
          </Link>
        )}
      </div>

      {!entry ? (
        <div className="mt-6 rounded-[20px] bg-white p-8 text-center text-[#8a7363] shadow-[0_5px_15px_#ddd]">
          还没有 About 内容。About 只有一份：一段文字 + 多张图片，点右上角「＋ 创建 About」开始。
        </div>
      ) : (
        <AboutManager entry={entry} images={images} />
      )}
    </div>
  );
}
