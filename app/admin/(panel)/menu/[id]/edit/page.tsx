import Link from "next/link";
import { notFound } from "next/navigation";
import ItemForm from "@/components/admin/ItemForm";
import { getSupabase } from "@/lib/supabase/public";
import type { MenuCategoryRow, MenuItemRow } from "@/lib/types";
import { updateItem } from "../../actions";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from("menu_categories").select("*").order("sort_order"),
    supabase.from("menu_items").select("*").eq("id", id),
  ]);
  const item = (items ?? [])[0] as MenuItemRow | undefined;
  if (!item) {
    notFound();
  }
  const updateBound = updateItem.bind(null, item.id);

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/admin/menu" className="text-sm text-[#8b4513] underline">
        ← 返回菜单管理
      </Link>
      <h1 className="mt-2 text-2xl font-bold">编辑饮品：{item.name_en}</h1>
      <div className="mt-6 rounded-[20px] bg-white p-6 shadow-[0_5px_15px_#ddd]">
        <ItemForm
          action={updateBound}
          categories={(categories ?? []) as MenuCategoryRow[]}
          initial={{
            name_en: item.name_en,
            name_zh: item.name_zh,
            category_id: item.category_id,
            description_en: item.description_en,
            description_zh: item.description_zh,
            price: item.price,
            sort_order: item.sort_order,
          }}
        />
      </div>
    </div>
  );
}
