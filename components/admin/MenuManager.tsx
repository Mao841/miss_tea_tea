"use client";

import Link from "next/link";
import Image from "next/image";
import type { MenuCategoryRow, MenuItemRow } from "@/lib/types";
import SortableList, { UpDownControls } from "@/components/admin/SortableList";
import DeleteButton from "@/components/admin/DeleteButton";
import {
  createCategory,
  deleteCategory,
  deleteItem,
  reorderCategories,
  reorderItems,
  toggleItem,
  updateCategory,
} from "@/app/admin/(panel)/menu/actions";

const inputCls =
  "rounded-xl border border-[#e5d5c5] bg-[#fff7ef] px-3 py-1.5 text-sm outline-none focus:border-[#8b4513]";
const btnPrimary =
  "rounded-full bg-[#8b4513] px-4 py-1.5 text-sm text-white hover:bg-[#7a3d11]";
const btnOutline =
  "rounded-full border border-[#8b4513] px-3 py-1 text-xs text-[#8b4513] hover:bg-[#8b4513] hover:text-white";

function ItemCard({ item }: { item: MenuItemRow }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {item.image_url && (
        <Image
          src={item.image_url}
          alt={item.name_en}
          width={40}
          height={40}
          className="h-10 w-10 rounded-lg object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {item.name_en}{" "}
          <span className="text-sm font-normal text-[#8a7363]">{item.name_zh}</span>
        </p>
        {item.description_en && (
          <p className="truncate text-sm text-[#8a7363]">
            {item.description_en}
            {item.description_zh ? ` / ${item.description_zh}` : ""}
          </p>
        )}
      </div>
      <span className="text-sm">{item.price !== null ? `€${item.price}` : "—"}</span>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs ${
          item.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}
      >
        {item.is_available ? "在售" : "停售"}
      </span>
      <form action={toggleItem}>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="is_available" value={String(item.is_available)} />
        <button className={btnOutline}>{item.is_available ? "下架" : "上架"}</button>
      </form>
      <Link href={`/admin/menu/${item.id}/edit`} className={btnOutline}>
        编辑
      </Link>
      <form action={deleteItem}>
        <input type="hidden" name="id" value={item.id} />
        <DeleteButton />
      </form>
    </div>
  );
}

function ItemGroup({ title, items }: { title: string; items: MenuItemRow[] }) {
  return (
    <div className="rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]">
      <h2 className="font-bold">
        {title}
        <span className="ml-2 text-xs font-normal text-[#8a7363]">▲▼ 调整顺序</span>
      </h2>
      <div className="mt-3">
        {items.length === 0 ? (
          <p className="py-3 text-sm text-[#8a7363]">该分类暂无饮品</p>
        ) : (
          <SortableList
            items={items}
            className="space-y-2"
            onReorder={reorderItems}
            render={(item, controls) => (
              <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[#fff7ef] px-3 py-2.5">
                <UpDownControls controls={controls} />
                <div className="min-w-0 flex-1">
                  <ItemCard item={item} />
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}

export default function MenuManager({
  categories,
  items,
}: {
  categories: MenuCategoryRow[];
  items: MenuItemRow[];
}) {
  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);
  const itemsOf = (id: string | null) =>
    items
      .filter((item) => item.category_id === id)
      .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <section className="mt-6 rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]">
        <h2 className="font-bold">📁 分类管理（▲▼ 调整顺序，或直接改排序数字）</h2>
        <SortableList
          items={sortedCategories}
          className="mt-4 space-y-3"
          onReorder={reorderCategories}
          render={(category, controls) => (
            <div className="flex flex-wrap items-center gap-2">
              <UpDownControls controls={controls} />
              <form action={updateCategory} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={category.id} />
                <input name="name_en" defaultValue={category.name_en} required className={inputCls} />
                <input name="name_zh" defaultValue={category.name_zh} required className={inputCls} />
                <label className="text-xs text-[#8a7363]">
                  排序
                  <input
                    type="number"
                    name="sort_order"
                    defaultValue={category.sort_order}
                    className={`${inputCls} ml-1 w-16`}
                  />
                </label>
                <button className={btnPrimary}>保存</button>
              </form>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={category.id} />
                <DeleteButton text="删除分类" />
              </form>
            </div>
          )}
        />
        <form
          action={createCategory}
          className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#f0e4d8] pt-3"
        >
          <input name="name_en" placeholder="分类英文名" required className={inputCls} />
          <input name="name_zh" placeholder="分类中文名" required className={inputCls} />
          <label className="text-xs text-[#8a7363]">
            排序
            <input type="number" name="sort_order" placeholder="自动" className={`${inputCls} ml-1 w-16`} />
          </label>
          <button className={btnPrimary}>＋ 添加分类</button>
        </form>
      </section>

      <section className="mt-6 space-y-6">
        {sortedCategories.map((category) => (
          <ItemGroup
            key={category.id}
            title={`${category.name_en} / ${category.name_zh}`}
            items={itemsOf(category.id)}
          />
        ))}
        {items.some((item) => !item.category_id) && (
          <ItemGroup title="未分类" items={itemsOf(null)} />
        )}
      </section>
    </>
  );
}
