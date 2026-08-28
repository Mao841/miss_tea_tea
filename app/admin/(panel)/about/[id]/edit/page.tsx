import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AboutForm from "@/components/admin/AboutForm";
import DeleteButton from "@/components/admin/DeleteButton";
import Toast, { DONE_TEXT } from "@/components/admin/Toast";
import { getSupabase } from "@/lib/supabase/public";
import type { AboutEntryRow, AboutImageRow } from "@/lib/types";
import { deleteAboutImage, updateAboutEntry } from "../../actions";

export default async function EditAboutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ done?: string }>;
}) {
  const { id } = await params;
  const { done } = await searchParams;
  const supabase = getSupabase();
  const [{ data: rows }, { data: imageRows }] = await Promise.all([
    supabase.from("about_entries").select("*").eq("id", id),
    supabase.from("about_images").select("*").eq("about_entry_id", id).order("sort_order"),
  ]);
  const entry = (rows ?? [])[0] as AboutEntryRow | undefined;
  if (!entry) {
    notFound();
  }
  const images = (imageRows ?? []) as AboutImageRow[];
  const updateBound = updateAboutEntry.bind(null, entry.id);

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      {done && <Toast text={DONE_TEXT[done] ?? "已完成 ✓"} />}
      <Link href="/admin/about" className="text-sm text-[#8b4513] underline">
        ← 返回 About 管理
      </Link>
      <h1 className="font-display mt-2 text-2xl font-bold">编辑板块：{entry.title_en}</h1>

      {images.length > 0 && (
        <div className="mt-6 rounded-[20px] bg-white p-6 shadow-[0_5px_15px_#ddd]">
          <h2 className="font-bold">当前图片（{images.length} 张）</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative">
                <Image
                  src={img.image_url}
                  alt="About 图片"
                  width={200}
                  height={200}
                  className="aspect-square w-full rounded-xl object-cover"
                />
                <form action={deleteAboutImage} className="absolute right-1 top-1">
                  <input type="hidden" name="image_id" value={img.id} />
                  <input type="hidden" name="entry_id" value={entry.id} />
                  <DeleteButton text="✕" className="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white hover:bg-red-700" />
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-[20px] bg-white p-6 shadow-[0_5px_15px_#ddd]">
        <AboutForm
          action={updateBound}
          submitText="保存修改"
          initial={{
            title_en: entry.title_en,
            title_zh: entry.title_zh,
            body_en: entry.body_en,
            body_zh: entry.body_zh,
          }}
        />
      </div>
    </div>
  );
}
