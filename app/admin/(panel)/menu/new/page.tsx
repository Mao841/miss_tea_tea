import Link from "next/link";
import ItemForm from "@/components/admin/ItemForm";
import { getSupabase } from "@/lib/supabase/public";
import type { MenuCategoryRow } from "@/lib/types";
import { createItem } from "../actions";

export default async function NewItemPage() {
  const supabase = getSupabase();
  const { data: categories } = await supabase
    .from("menu_categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/admin/menu" className="text-sm text-[#8b4513] underline">
        ← 返回菜单管理
      </Link>
      <h1 className="mt-2 text-2xl font-bold">新增饮品</h1>
      <div className="mt-6 rounded-[20px] bg-white p-6 shadow-[0_5px_15px_#ddd]">
        <ItemForm
          action={createItem}
          categories={(categories ?? []) as MenuCategoryRow[]}
          initial={{
            name_en: "",
            name_zh: "",
            category_id: null,
            description_en: "",
            description_zh: "",
            price: null,
            sort_order: 0,
          }}
        />
      </div>
    </div>
  );
}
