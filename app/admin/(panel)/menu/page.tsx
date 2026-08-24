import Link from "next/link";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase/public";
import type { MenuCategoryRow, MenuItemRow } from "@/lib/types";
import {
  createCategory,
  deleteCategory,
  deleteItem,
  toggleItem,
  updateCategory,
} from "./actions";

const inputCls =
  "rounded-xl border border-[#e5d5c5] bg-[#fff7ef] px-3 py-1.5 text-sm outline-none focus:border-[#8b4513]";
const btnPrimary =
  "rounded-full bg-[#8b4513] px-4 py-1.5 text-sm text-white hover:bg-[#7a3d11]";
const btnOutline =
  "rounded-full border border-[#8b4513] px-3 py-1 text-xs text-[#8b4513] hover:bg-[#8b4513] hover:text-white";
const btnDanger =
  "rounded-full border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-600 hover:text-white";

function CategoryBlock({
  category,
  items,
}: {
  category: MenuCategoryRow | null;
  items: MenuItemRow[];
}) {
  return (
    <section className="rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]">
      <h2 className="font-bold">
        {category ? `${category.name_en} / ${category.name_zh}` : "未分类"}
      </h2>
      <div className="mt-3 divide-y divide-[#f0e4d8]">
        {items.length === 0 && (
          <p className="py-3 text-sm text-[#8a7363]">该分类暂无饮品</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-3 py-3">
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
              <button className={btnOutline}>
                {item.is_available ? "下架" : "上架"}
              </button>
            </form>
            <Link href={`/admin/menu/${item.id}/edit`} className={btnOutline}>
              编辑
            </Link>
            <form action={deleteItem} className="flex items-center gap-1">
              <input type="hidden" name="id" value={item.id} />
              <label className="flex items-center gap-1 text-xs text-[#8a7363]">
                <input type="checkbox" required /> 确认
              </label>
              <button className={btnDanger}>删除</button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function AdminMenuPage() {
  const supabase = getSupabase();
  const { data: categories } = await supabase
    .from("menu_categories")
    .select("*")
    .order("sort_order");
  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .order("sort_order");
  const categoryRows = (categories ?? []) as MenuCategoryRow[];
  const itemRows = (items ?? []) as MenuItemRow[];

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-[#8b4513] underline">
            ← 返回后台首页
          </Link>
          <h1 className="mt-2 text-2xl font-bold">🍹 菜单管理</h1>
        </div>
        <Link
          href="/admin/menu/new"
          className="rounded-full bg-[#8b4513] px-5 py-2.5 text-white no-underline hover:bg-[#7a3d11]"
        >
          ＋ 新增饮品
        </Link>
      </div>

      <section className="mt-6 rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]">
        <h2 className="font-bold">📁 分类管理</h2>
        <div className="mt-4 space-y-3">
          {categoryRows.map((category) => (
            <div key={category.id} className="flex flex-wrap items-center gap-2">
              <form action={updateCategory} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={category.id} />
                <input name="name_en" defaultValue={category.name_en} required className={inputCls} />
                <input name="name_zh" defaultValue={category.name_zh} required className={inputCls} />
                <input
                  type="number"
                  name="sort_order"
                  defaultValue={category.sort_order}
                  className={`${inputCls} w-20`}
                />
                <button className={btnPrimary}>保存</button>
              </form>
              <form action={deleteCategory} className="flex items-center gap-1">
                <input type="hidden" name="id" value={category.id} />
                <label className="flex items-center gap-1 text-xs text-[#8a7363]">
                  <input type="checkbox" required /> 确认
                </label>
                <button className={btnDanger}>删除分类</button>
              </form>
            </div>
          ))}
          <form
            action={createCategory}
            className="flex flex-wrap items-center gap-2 border-t border-[#f0e4d8] pt-3"
          >
            <input name="name_en" placeholder="分类英文名" required className={inputCls} />
            <input name="name_zh" placeholder="分类中文名" required className={inputCls} />
            <input type="number" name="sort_order" placeholder="排序" className={`${inputCls} w-20`} />
            <button className={btnPrimary}>＋ 添加分类</button>
          </form>
        </div>
      </section>

      <section className="mt-6 space-y-6">
        {categoryRows.map((category) => (
          <CategoryBlock
            key={category.id}
            category={category}
            items={itemRows.filter((item) => item.category_id === category.id)}
          />
        ))}
        {itemRows.some((item) => !item.category_id) && (
          <CategoryBlock
            category={null}
            items={itemRows.filter((item) => !item.category_id)}
          />
        )}
      </section>
    </div>
  );
}
