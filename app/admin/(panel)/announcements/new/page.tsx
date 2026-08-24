import Link from "next/link";
import AnnouncementForm from "@/components/admin/AnnouncementForm";
import { createAnnouncement } from "../actions";

export default function NewAnnouncementPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/admin/announcements" className="text-sm text-[#8b4513] underline">
        ← 返回活动管理
      </Link>
      <h1 className="mt-2 text-2xl font-bold">新增活动</h1>
      <div className="mt-6 rounded-[20px] bg-white p-6 shadow-[0_5px_15px_#ddd]">
        <AnnouncementForm
          action={createAnnouncement}
          initial={{ title_en: "", title_zh: "", body_en: "", body_zh: "", sort_order: 0 }}
        />
      </div>
    </div>
  );
}
