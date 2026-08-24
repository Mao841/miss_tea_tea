"use client";

import { useActionState } from "react";
import Image from "next/image";
import type { ActionState } from "@/app/admin/(panel)/announcements/actions";

type InitialValues = {
  title_en: string;
  title_zh: string;
  body_en: string;
  body_zh: string;
  image_url: string;
  sort_order: number;
};

const labelCls = "mt-4 block text-sm font-medium text-[#4b2e20]";
const inputCls =
  "mt-1 w-full rounded-xl border border-[#e5d5c5] bg-[#fff7ef] px-3 py-2 text-sm outline-none focus:border-[#8b4513]";
const fileCls =
  "mt-1 w-full text-sm text-[#4b2e20] file:mr-3 file:rounded-full file:border-0 file:bg-[#8b4513] file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-[#7a3d11]";

export default function AnnouncementForm({
  action,
  initial,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initial: InitialValues;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction}>
      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      <label className={labelCls}>
        英文标题 *
        <input name="title_en" required defaultValue={initial.title_en} className={inputCls} />
      </label>
      <label className={labelCls}>
        中文标题 *
        <input name="title_zh" required defaultValue={initial.title_zh} className={inputCls} />
      </label>
      <label className={labelCls}>
        英文内容
        <textarea name="body_en" defaultValue={initial.body_en} rows={2} className={inputCls} />
      </label>
      <label className={labelCls}>
        中文内容
        <textarea name="body_zh" defaultValue={initial.body_zh} rows={2} className={inputCls} />
      </label>
      <input type="hidden" name="current_image" value={initial.image_url} />
      {initial.image_url && (
        <div className="mt-4">
          <p className="text-sm font-medium text-[#4b2e20]">当前图片</p>
          <Image
            src={initial.image_url}
            alt="当前活动图片"
            width={96}
            height={96}
            className="mt-1 h-24 w-24 rounded-xl object-cover"
          />
          <label className="mt-3 flex items-center gap-2 text-sm text-[#4b2e20]">
            <input type="checkbox" name="remove_image" value="on" />
            删除现有图片
          </label>
        </div>
      )}
      <label className={labelCls}>
        图片（可选，建议 1:1 正方形，不超过 5MB；不选则保留原图）
        <input type="file" name="image" accept="image/*" className={fileCls} />
      </label>
      <label className={labelCls}>
        排序（数字越小越靠前，首页只显示第一条）
        <input type="number" name="sort_order" defaultValue={initial.sort_order} className={inputCls} />
      </label>
      <button
        disabled={pending}
        className="mt-6 w-full rounded-full bg-[#8b4513] py-3 text-white hover:bg-[#7a3d11] disabled:opacity-50"
      >
        {pending ? "保存中…" : "保存"}
      </button>
    </form>
  );
}
