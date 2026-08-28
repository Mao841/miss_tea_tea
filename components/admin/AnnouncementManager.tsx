"use client";

import Link from "next/link";
import Image from "next/image";
import type { AnnouncementRow } from "@/lib/types";
import SortableList, { UpDownControls } from "@/components/admin/SortableList";
import DeleteButton from "@/components/admin/DeleteButton";
import {
  deleteAnnouncement,
  reorderAnnouncements,
  toggleAnnouncement,
} from "@/app/admin/(panel)/announcements/actions";

const btnOutline =
  "rounded-full border border-[#8b4513] px-3 py-1 text-xs text-[#8b4513] hover:bg-[#8b4513] hover:text-white";

export default function AnnouncementManager({
  announcements,
}: {
  announcements: AnnouncementRow[];
}) {
  const sorted = [...announcements].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <SortableList
      items={sorted}
      className="mt-6 space-y-4"
      onReorder={reorderAnnouncements}
      render={(announcement, controls) => (
        <div className="rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]">
          <div className="flex flex-wrap items-center gap-3">
            <UpDownControls controls={controls} />
            {announcement.image_url && (
              <Image
                src={announcement.image_url}
                alt={announcement.title_en}
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-xl object-cover"
              />
            )}
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
            <Link href={`/admin/announcements/${announcement.id}/edit`} className={btnOutline}>
              编辑
            </Link>
            <form action={deleteAnnouncement}>
              <input type="hidden" name="id" value={announcement.id} />
              <DeleteButton />
            </form>
          </div>
        </div>
      )}
    />
  );
}
