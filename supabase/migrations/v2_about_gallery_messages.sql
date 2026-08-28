-- ============================================================
-- Miss Tea Tea v2 增量迁移：About / Gallery / Messages
-- 在 Supabase 后台：SQL Editor → New query → 粘贴运行（幂等，可重复执行）
-- 不修改任何旧表；set_updated_at() 函数沿用 v1 已创建的。
-- ============================================================

-- 1. About 板块（文字 + 图片，可多条按 sort_order 排序）
create table if not exists public.about_entries (
  id          uuid primary key default gen_random_uuid(),
  title_en    text not null default '',
  title_zh    text not null default '',
  body_en     text not null default '',
  body_zh     text not null default '',
  image_url   text not null default '',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. Gallery 图片墙（图片 + 可选说明，按 sort_order 排序）
create table if not exists public.gallery_photos (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  caption_en  text not null default '',
  caption_zh  text not null default '',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- 3. 顾客留言（文字 + 图片；老板后台可见）
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  nickname    text not null default '',          -- 昵称可选，空则显示为匿名顾客
  body        text not null default '',
  image_url   text not null default '',
  is_read     boolean not null default false,    -- 老板后台"未读"标记
  created_at  timestamptz not null default now()
);

-- 4. About 的 updated_at 自动更新触发器
drop trigger if exists about_entries_set_updated_at on public.about_entries;
create trigger about_entries_set_updated_at
  before update on public.about_entries
  for each row execute function public.set_updated_at();

-- 5. 行级安全（RLS）
alter table public.about_entries enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.messages enable row level security;

-- About / Gallery：游客只读，登录用户（老板）读写 —— 与 v1 各表一致
create policy "anon_read_about" on public.about_entries
  for select using (true);
create policy "auth_write_about" on public.about_entries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "anon_read_gallery" on public.gallery_photos
  for select using (true);
create policy "auth_write_gallery" on public.gallery_photos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Messages：游客只能 INSERT（留言），不能读/改/删（保护隐私）；
-- 老板（authenticated）可读全部并可标记已读/删除。
create policy "anon_insert_messages" on public.messages
  for insert with check (true);
create policy "auth_all_messages" on public.messages
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
