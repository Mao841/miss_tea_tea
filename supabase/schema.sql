-- ============================================================
-- Miss Tea Tea 数据库结构 + 行级安全 (RLS)
-- 在 Supabase 后台：SQL Editor → New query → 粘贴运行
-- ============================================================

-- 1. 菜单分类
create table if not exists public.menu_categories (
  id          uuid primary key default gen_random_uuid(),
  name_en     text not null,
  name_zh     text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- 2. 菜单项（饮品）
create table if not exists public.menu_items (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid references public.menu_categories(id) on delete set null,
  name_en        text not null,
  name_zh        text not null,
  description_en text not null default '',
  description_zh text not null default '',
  price          numeric(6,2),
  image_url      text not null default '',
  is_available   boolean not null default true,
  is_featured    boolean not null default false,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 3. 公告/活动
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title_en    text not null,
  title_zh    text not null,
  body_en     text not null default '',
  body_zh     text not null default '',
  image_url   text not null default '',
  is_active   boolean not null default true,
  starts_at   timestamptz,
  ends_at     timestamptz,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- 兼容已有库：为公告表补充活动图片字段（新建库已含该列，此处幂等安全，可重复执行）
alter table public.announcements add column if not exists image_url text not null default '';

-- 4. 店铺设置（key-value）
create table if not exists public.store_settings (
  key        text primary key,
  value_en   text not null default '',
  value_zh   text not null default '',
  updated_at timestamptz not null default now()
);

-- 5. updated_at 自动更新触发器
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

drop trigger if exists store_settings_set_updated_at on public.store_settings;
create trigger store_settings_set_updated_at
  before update on public.store_settings
  for each row execute function public.set_updated_at();

-- 6. 行级安全（RLS）：游客只读，登录用户（老板）可写
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.announcements enable row level security;
alter table public.store_settings enable row level security;

create policy "anon_read_categories" on public.menu_categories
  for select using (true);
create policy "anon_read_items" on public.menu_items
  for select using (true);
create policy "anon_read_announcements" on public.announcements
  for select using (true);
create policy "anon_read_settings" on public.store_settings
  for select using (true);

create policy "auth_write_categories" on public.menu_categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_write_items" on public.menu_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_write_announcements" on public.announcements
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_write_settings" on public.store_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
