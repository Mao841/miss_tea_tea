import { getSupabase } from "@/lib/supabase/public";
import type {
  AboutEntry,
  AboutEntryRow,
  AboutImageRow,
  Announcement,
  AnnouncementRow,
  GalleryPhoto,
  GalleryPhotoRow,
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
      .map((item) => ({
        en: item.name_en,
        zh: item.name_zh,
        image: item.image_url || undefined,
        descriptionEn: item.description_en,
        descriptionZh: item.description_zh,
        price: item.price,
      })),
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
    image: row.image_url || undefined,
  }));
}

export async function getAboutEntries(): Promise<AboutEntry[]> {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase
    .from("about_entries")
    .select("*")
    .order("sort_order");
  if (error) {
    console.error("加载 About 失败:", error.message);
    return [];
  }
  const { data: imageRows } = await supabase
    .from("about_images")
    .select("*")
    .order("sort_order");
  const imagesByEntry = new Map<string, string[]>();
  for (const img of (imageRows ?? []) as AboutImageRow[]) {
    const list = imagesByEntry.get(img.about_entry_id) ?? [];
    list.push(img.image_url);
    imagesByEntry.set(img.about_entry_id, list);
  }
  return (rows ?? [] as AboutEntryRow[]).map((row) => {
    const images = imagesByEntry.get(row.id) ?? [];
    return {
      titleEn: row.title_en,
      titleZh: row.title_zh,
      bodyEn: row.body_en,
      bodyZh: row.body_zh,
      image: row.image_url || undefined,
      images,
    };
  });
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase
    .from("gallery_photos")
    .select("*")
    .order("sort_order");
  if (error) {
    console.error("加载 Gallery 失败:", error.message);
    return [];
  }
  return (rows ?? [] as GalleryPhotoRow[]).map((row) => ({
    image: row.image_url,
    captionEn: row.caption_en,
    captionZh: row.caption_zh,
  }));
}
