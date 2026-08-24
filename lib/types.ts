export type MenuCategoryRow = {
  id: string;
  name_en: string;
  name_zh: string;
  sort_order: number;
};

export type MenuItemRow = {
  id: string;
  category_id: string | null;
  name_en: string;
  name_zh: string;
  description_en: string;
  description_zh: string;
  price: number | null;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
};

export type AnnouncementRow = {
  id: string;
  title_en: string;
  title_zh: string;
  body_en: string;
  body_zh: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
};

export type StoreSettingRow = {
  key: string;
  value_en: string;
  value_zh: string;
};

export type MenuItem = { en: string; zh: string };

export type MenuCategory = { nameEn: string; nameZh: string; items: MenuItem[] };

export type Announcement = {
  titleEn: string;
  titleZh: string;
  bodyEn: string;
  bodyZh: string;
};

export type StoreSettings = Record<string, { en: string; zh: string }>;
