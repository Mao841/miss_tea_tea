"use client";

import Image from "next/image";
import type { GalleryPhotoRow } from "@/lib/types";
import SortableList, { UpDownControls } from "@/components/admin/SortableList";
import DeleteButton from "@/components/admin/DeleteButton";
import ImagePicker from "@/components/admin/ImagePicker";
import {
  createPhoto,
  deletePhoto,
  reorderPhotos,
} from "@/app/admin/(panel)/gallery/actions";

const inputCls =
  "rounded-xl border border-[#e5d5c5] bg-[#fff7ef] px-3 py-1.5 text-sm outline-none focus:border-[#8b4513]";
const btnPrimary =
  "rounded-full bg-[#8b4513] px-4 py-1.5 text-sm text-white hover:bg-[#7a3d11]";

export default function GalleryManager({ photos }: { photos: GalleryPhotoRow[] }) {
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <section className="mt-6 rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]">
        <h2 className="font-bold">＋ 新增照片</h2>
        <form action={createPhoto} className="mt-3 flex flex-wrap items-end gap-2">
          <ImagePicker name="image" required label="图片 *" />
          <label className="text-sm text-[#4b2e20]">
            英文说明
            <input name="caption_en" placeholder="可选" className={`${inputCls} mt-1 block w-44`} />
          </label>
          <label className="text-sm text-[#4b2e20]">
            中文说明
            <input name="caption_zh" placeholder="可选" className={`${inputCls} mt-1 block w-44`} />
          </label>
          <label className="text-sm text-[#4b2e20]">
            排序
            <input type="number" name="sort_order" placeholder="自动" className={`${inputCls} mt-1 block w-20`} />
          </label>
          <button className={btnPrimary}>上传</button>
        </form>
      </section>

      {sorted.length === 0 ? (
        <div className="mt-6 rounded-[20px] bg-white p-8 text-center text-[#8a7363] shadow-[0_5px_15px_#ddd]">
          还没有照片，用上面的表单上传第一张吧（拖 ⋮⋮ 可调整顺序）
        </div>
      ) : (
        <SortableList
          items={sorted}
          className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3"
          onReorder={reorderPhotos}
          render={(photo, controls) => (
            <div className="rounded-[20px] bg-white p-3 shadow-[0_5px_15px_#ddd]">
              <Image
                src={photo.image_url}
                alt={photo.caption_en || "Gallery photo"}
                width={300}
                height={300}
                className="aspect-square w-full rounded-xl object-cover"
              />
              {(photo.caption_en || photo.caption_zh) && (
                <p className="mt-2 truncate text-xs text-[#8a7363]">
                  {photo.caption_en}
                  {photo.caption_en && photo.caption_zh ? " / " : ""}
                  {photo.caption_zh}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <UpDownControls controls={controls} />
                <form action={deletePhoto}>
                  <input type="hidden" name="id" value={photo.id} />
                  <DeleteButton />
                </form>
              </div>
            </div>
          )}
        />
      )}
    </>
  );
}
