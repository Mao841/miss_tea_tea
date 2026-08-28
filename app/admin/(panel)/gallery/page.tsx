import Link from "next/link";
import { getSupabase } from "@/lib/supabase/public";
import type { GalleryPhotoRow } from "@/lib/types";
import GalleryManager from "@/components/admin/GalleryManager";
import Toast, { DONE_TEXT } from "@/components/admin/Toast";

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  const { done } = await searchParams;
  const supabase = getSupabase();
  const { data: rows } = await supabase
    .from("gallery_photos")
    .select("*")
    .order("sort_order");
  const photos = (rows ?? []) as GalleryPhotoRow[];

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      {done && <Toast text={DONE_TEXT[done] ?? "已完成 ✓"} />}
      <div>
        <Link href="/admin" className="text-sm text-[#8b4513] underline">
          ← 返回后台首页
        </Link>
        <h1 className="font-display mt-2 text-2xl font-bold">🖼️ Gallery 管理</h1>
      </div>

      <GalleryManager photos={photos} />
    </div>
  );
}
