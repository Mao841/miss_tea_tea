import Link from "next/link";
import { getSupabase } from "@/lib/supabase/public";
import type { MenuCategoryRow, MenuItemRow } from "@/lib/types";
import MenuManager from "@/components/admin/MenuManager";
import Toast, { DONE_TEXT } from "@/components/admin/Toast";

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  const { done } = await searchParams;
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
      {done && <Toast text={DONE_TEXT[done] ?? "已完成 ✓"} />}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-[#8b4513] underline">
            ← 返回后台首页
          </Link>
          <h1 className="font-display mt-2 text-2xl font-bold">🍹 菜单管理</h1>
        </div>
        <Link
          href="/admin/menu/new"
          className="rounded-full bg-[#8b4513] px-5 py-2.5 text-white no-underline hover:bg-[#7a3d11]"
        >
          ＋ 新增饮品
        </Link>
      </div>

      <MenuManager categories={categoryRows} items={itemRows} />
    </div>
  );
}
