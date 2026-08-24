import Link from "next/link";
import { notFound } from "next/navigation";
import AnnouncementForm from "@/components/admin/AnnouncementForm";
import { getSupabase } from "@/lib/supabase/public";
import type { AnnouncementRow } from "@/lib/types";
import { updateAnnouncement } from "../../actions";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();
  const { data: rows } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id);
  const announcement = (rows ?? [])[0] as AnnouncementRow | undefined;
  if (!announcement) {
    notFound();
  }
  const updateBound = updateAnnouncement.bind(null, announcement.id);

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/admin/announcements" className="text-sm text-[#8b4513] underline">
        ← 返回活动管理
      </Link>
      <h1 className="mt-2 text-2xl font-bold">编辑活动：{announcement.title_en}</h1>
      <div className="mt-6 rounded-[20px] bg-white p-6 shadow-[0_5px_15px_#ddd]">
        <AnnouncementForm
          action={updateBound}
          initial={{
            title_en: announcement.title_en,
            title_zh: announcement.title_zh,
            body_en: announcement.body_en,
            body_zh: announcement.body_zh,
            sort_order: announcement.sort_order,
          }}
        />
      </div>
    </div>
  );
}
