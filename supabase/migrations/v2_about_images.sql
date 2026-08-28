-- ============================================================
-- Miss Tea Tea v2 增量迁移：About 多图支持
-- 在 Supabase 后台：SQL Editor → New query → 粘贴运行（幂等，可重复执行）
-- ============================================================

-- About 板块的图片表（一个板块可配多张图片）
create table if not exists public.about_images (
  id              uuid primary key default gen_random_uuid(),
  about_entry_id  uuid not null references public.about_entries(id) on delete cascade,
  image_url       text not null,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now()
);

-- 行级安全：游客只读，老板（authenticated）读写 —— 与其他表一致
alter table public.about_images enable row level security;

create policy "anon_read_about_images" on public.about_images
  for select using (true);
create policy "auth_write_about_images" on public.about_images
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
