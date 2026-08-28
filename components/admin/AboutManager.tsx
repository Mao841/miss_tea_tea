"use client";

import Link from "next/link";
import Image from "next/image";
import type { AboutEntryRow, AboutImageRow } from "@/lib/types";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteAboutEntry } from "@/app/admin/(panel)/about/actions";

const btnOutline =
  "rounded-full border border-[#8b4513] px-3 py-1 text-xs text-[#8b4513] hover:bg-[#8b4513] hover:text-white";

// About 只有一份内容：文字 + 多张图片
export default function AboutManager({
  entry,
  images,
}: {
  entry: AboutEntryRow;
  images: AboutImageRow[];
}) {
  return (
    <div className="mt-6 rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]">
      <div className="flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 font-bold">
          {entry.title_en}{" "}
          <span className="text-sm font-normal text-[#8a7363]">{entry.title_zh}</span>
        </p>
        <span className="text-xs text-[#8a7363]">{images.length} 张图片</span>
        <Link href={`/admin/about/${entry.id}/edit`} className={btnOutline}>
          编辑
        </Link>
        <form action={deleteAboutEntry}>
          <input type="hidden" name="id" value={entry.id} />
          <DeleteButton text="删除整份 About" />
        </form>
      </div>
      {(entry.body_en || entry.body_zh) && (
        <p className="mt-2 whitespace-pre-line text-sm text-[#8a7363]">
          {entry.body_en}
          {entry.body_en && entry.body_zh ? "\n" : ""}
          {entry.body_zh}
        </p>
      )}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <Image
              key={img.id}
              src={img.image_url}
              alt="About 图片"
              width={200}
              height={200}
              className="aspect-square w-full rounded-xl object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}
