-- ============================================================
-- Miss Tea Tea 数据迁移：把 index.html 的硬编码内容写入数据库
-- 在 Supabase 后台：SQL Editor → New query → 粘贴运行
-- 注意：本脚本只运行一次（重复运行会产生重复数据）
-- ============================================================

-- 1. 菜单分类
insert into public.menu_categories (name_en, name_zh, sort_order) values
  ('Milk Tea', '奶茶', 1),
  ('Fruit Tea', '水果茶', 2);

-- 2. 菜单项（饮品），通过子查询关联分类
insert into public.menu_items (category_id, name_en, name_zh, sort_order) values
  ((select id from public.menu_categories where name_en = 'Milk Tea'), 'Brown Sugar Boba Milk', '黑糖珍珠奶茶', 1),
  ((select id from public.menu_categories where name_en = 'Milk Tea'), 'Taro Milk Tea', '香芋奶茶', 2),
  ((select id from public.menu_categories where name_en = 'Milk Tea'), 'Matcha Latte', '抹茶拿铁', 3),
  ((select id from public.menu_categories where name_en = 'Fruit Tea'), 'Fruit Tea', '新鲜水果茶', 1);

-- 3. 店铺设置（key-value；可重复运行，已存在则更新）
-- 注：中文文案为迁移时的翻译，老板可在后台随时修改
insert into public.store_settings (key, value_en, value_zh) values
  ('address', 'Bondgenotenlaan 106, Leuven, Belgium', 'Bondgenotenlaan 106，鲁汶，比利时'),
  ('opening_hours', 'Mon-Sun: 11:00 - 21:00', '周一至周日：11:00 - 21:00'),
  ('instagram', '@MissTeaTea', '@MissTeaTea'),
  ('hero_slogan', 'Cute Asian Bubble Tea Shop in Leuven', '位于鲁汶的可爱亚洲奶茶店')
on conflict (key) do update
  set value_en = excluded.value_en, value_zh = excluded.value_zh;

-- 4. 学生福利公告
insert into public.announcements (title_en, title_zh, body_en, body_zh, is_active, sort_order) values
  ('KU Leuven Student Special', 'KU Leuven 新生福利', 'Buy one get one free with a valid student card!', '凭学生证买一送一！', true, 1);
