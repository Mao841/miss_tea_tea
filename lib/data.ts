import { getSupabase } from "@/lib/supabase";
import type {
  Announcement,
  AnnouncementRow,
  MenuCategory,
  MenuCategoryRow,
  MenuItemRow,
  StoreSettings,
  StoreSettingRow,
} from "@/lib/types";

export async function getMenu(): Promise<MenuCategory[]> {
  const supabase = getSupabase();
  const { data: categoryRows, error: categoryError } = await supabase
    .from("menu_categories")
    .select("*")
    .order("sort_order");
  const { data: itemRows, error: itemError } = await supabase
    .from("menu_items")
    .select("*")
    .order("sort_order");
  if (categoryError || itemError) {
    console.error("加载菜单失败:", categoryError?.message ?? itemError?.message);
    return [];
  }
  return (categoryRows ?? [] as MenuCategoryRow[]).map((category) => ({
    nameEn: category.name_en,
    nameZh: category.name_zh,
    items: (itemRows ?? [] as MenuItemRow[])
      .filter((item) => item.category_id === category.id && item.is_available)
      .map((item) => ({ en: item.name_en, zh: item.name_zh })),
  }));
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase.from("store_settings").select("*");
  if (error) {
    console.error("加载店铺信息失败:", error.message);
    return {};
  }
  return Object.fromEntries(
    (rows ?? [] as StoreSettingRow[]).map((row) => [row.key, { en: row.value_en, zh: row.value_zh }])
  );
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) {
    console.error("加载公告失败:", error.message);
    return [];
  }
  return (rows ?? [] as AnnouncementRow[]).map((row) => ({
    titleEn: row.title_en,
    titleZh: row.title_zh,
    bodyEn: row.body_en,
    bodyZh: row.body_zh,
  }));
}
