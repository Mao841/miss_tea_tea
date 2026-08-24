"use client";

import { useActionState } from "react";
import type { MenuCategoryRow } from "@/lib/types";
import type { ActionState } from "@/app/admin/(panel)/menu/actions";

type InitialValues = {
  name_en: string;
  name_zh: string;
  category_id: string | null;
  description_en: string;
  description_zh: string;
  price: number | null;
  sort_order: number;
};

const labelCls = "mt-4 block text-sm font-medium text-[#4b2e20]";
const inputCls =
  "mt-1 w-full rounded-xl border border-[#e5d5c5] bg-[#fff7ef] px-3 py-2 text-sm outline-none focus:border-[#8b4513]";

export default function ItemForm({
  action,
  initial,
  categories,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initial: InitialValues;
  categories: MenuCategoryRow[];
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction}>
      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      <label className={labelCls}>
        英文名 *
        <input name="name_en" required defaultValue={initial.name_en} className={inputCls} />
      </label>
      <label className={labelCls}>
        中文名 *
        <input name="name_zh" required defaultValue={initial.name_zh} className={inputCls} />
      </label>
      <label className={labelCls}>
        分类
        <select name="category_id" defaultValue={initial.category_id ?? ""} className={inputCls}>
          <option value="">未分类</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name_en} / {category.name_zh}
            </option>
          ))}
        </select>
      </label>
      <label className={labelCls}>
        英文描述
        <textarea name="description_en" defaultValue={initial.description_en} rows={2} className={inputCls} />
      </label>
      <label className={labelCls}>
        中文描述
        <textarea name="description_zh" defaultValue={initial.description_zh} rows={2} className={inputCls} />
      </label>
      <label className={labelCls}>
        价格（欧元）
        <input
          type="number"
          step="0.01"
          min="0"
          name="price"
          defaultValue={initial.price ?? ""}
          placeholder="留空则不显示"
          className={inputCls}
        />
      </label>
      <label className={labelCls}>
        排序（数字越小越靠前）
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
