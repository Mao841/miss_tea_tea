#!/usr/bin/env node
// ============================================================
// Miss Tea Tea v2 全功能端到端测试脚本（零数据变更保证）
//
// 覆盖：
//   1. 静态资源与环境变量
//   2. 公开单页（各 section / 导航 / 图标 / 灯箱 / NEWS 条件渲染一致性）
//   3. 路由与登录保护（旧 /menu 重定向、/admin 各页 307）
//   4. 行级安全 RLS（游客只读/只插留言/禁写、禁上传）
//   5. 老板登录（需凭证）
//   6. CRUD 往返：菜单分类/饮品、公告、About(多图)、Gallery、留言
//   7. Storage 图片：上传 → 公开访问 → 删除
//   8. 店铺设置写路径
//   9. 数据零变更：8 张表 + Storage 前后快照一致
//
// 运行：
//   公开部分（无需凭证）:  node scripts/test-all.mjs
//   全量（含写路径）:
//     $env:TEST_OWNER_EMAIL="老板邮箱"
//     $env:TEST_OWNER_PASSWORD="老板密码"
//     node scripts/test-all.mjs
// ============================================================
import { spawn } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const PORT = 3210;
const BASE = `http://localhost:${PORT}`;
const results = [];
let serverProc = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`[${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
  return ok;
}

function skip(name, detail = "") {
  results.push({ name, ok: true, skipped: true });
  console.log(`[SKIP] ${name}${detail ? ` — ${detail}` : ""}`);
}

function loadEnv(file) {
  const env = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, "");
  }
  return env;
}

const envLocal = loadEnv(path.join(process.cwd(), ".env.local"));
const SUPABASE_URL = envLocal.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = envLocal.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const REF = SUPABASE_URL?.replace("https://", "").split(".")[0];
const AUTH_COOKIE = `sb-${REF}-auth-token`;

const ownerEmail = process.env.TEST_OWNER_EMAIL;
const ownerPassword = process.env.TEST_OWNER_PASSWORD;
const hasCreds = Boolean(ownerEmail && ownerPassword);

// 8 张业务表
const ALL_TABLES = [
  "menu_categories",
  "menu_items",
  "announcements",
  "store_settings",
  "about_entries",
  "about_images",
  "gallery_photos",
  "messages",
];

async function sb(pathname, { method = "GET", token, body, headers } = {}) {
  const res = await fetch(`${SUPABASE_URL}${pathname}`, {
    method,
    redirect: "manual",
    signal: AbortSignal.timeout(25000),
    headers: {
      apikey: ANON_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, json, text };
}

async function appFetch(pathname, { cookie } = {}) {
  return fetch(`${BASE}${pathname}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(25000),
    headers: cookie ? { cookie } : {},
  });
}

async function startServer() {
  serverProc = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)],
    { stdio: "ignore", cwd: process.cwd() }
  );
  for (let i = 0; i < 90; i++) {
    try {
      const r = await fetch(`${BASE}/robots.txt`, { signal: AbortSignal.timeout(3000) });
      if (r.status === 200) return;
    } catch {}
    await sleep(1000);
  }
  throw new Error("服务器启动超时");
}

function stopServer() {
  try {
    serverProc?.kill();
  } catch {}
}

// 快照：8 张表内容字段 + Storage 文件列表（忽略时间戳）
async function snapshot(token) {
  const out = {};
  for (const table of ALL_TABLES) {
    const r = await sb(`/rest/v1/${table}?select=*`, { token });
    out[table] = (r.json ?? [])
      .map((row) => {
        const { created_at, updated_at, ...rest } = row;
        return JSON.stringify(rest);
      })
      .sort();
  }
  if (token) {
    const listRes = await sb("/storage/v1/object/list/images", {
      method: "POST",
      token,
      body: { prefix: "", limit: 1000 },
    });
    out.storage = (listRes.json ?? []).map((f) => f.name).sort();
  } else {
    out.storage = "no-token";
  }
  return JSON.stringify(out);
}

async function buildAuthCookie(session) {
  const candidates = [JSON.stringify(session), encodeURIComponent(JSON.stringify(session))];
  for (const value of candidates) {
    const r = await appFetch("/admin", { cookie: `${AUTH_COOKIE}=${value}` });
    if (r.status === 200) return value;
  }
  return null;
}

// 1x1 红色 PNG
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

async function uploadStorage(token, filePath) {
  return fetch(`${SUPABASE_URL}/storage/v1/object/images/${filePath}`, {
    method: "POST",
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "image/png" },
    body: TINY_PNG,
    signal: AbortSignal.timeout(25000),
  });
}

async function deleteStorage(token, filePath) {
  return fetch(`${SUPABASE_URL}/storage/v1/object/images/${filePath}`, {
    method: "DELETE",
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(25000),
  });
}

async function storageGone(token, filePath) {
  for (let i = 0; i < 5; i++) {
    const list = await sb("/storage/v1/object/list/images", {
      method: "POST",
      token,
      body: { prefix: filePath, limit: 10 },
    });
    if ((list.json ?? []).length === 0) return true;
    await sleep(1500);
  }
  return false;
}

async function cleanup(token) {
  if (!token) return;
  await sb("/rest/v1/menu_items?name_en=like.__TEST*", { method: "DELETE", token });
  await sb("/rest/v1/menu_categories?name_en=like.__TEST*", { method: "DELETE", token });
  await sb("/rest/v1/announcements?title_en=like.__TEST*", { method: "DELETE", token });
  await sb("/rest/v1/about_entries?title_en=like.__TEST*", { method: "DELETE", token });
  await sb("/rest/v1/gallery_photos?caption_en=like.__TEST*", { method: "DELETE", token });
  await sb("/rest/v1/messages?body=like.__TEST*", { method: "DELETE", token });
}

// ------------------------------------------------------------
async function main() {
  let token = null;
  let before = null;
  let cookieValue = null;
  try {
    await startServer();
    console.log(`== 测试服务器已启动: ${BASE}（生产构建）\n`);

    // ---------- 1. 环境与静态资源 ----------
    console.log("【1. 环境与静态资源】");
    check("SUPABASE_URL 已配置", typeof SUPABASE_URL === "string" && SUPABASE_URL.startsWith("https://"));
    check("ANON_KEY 已配置", typeof ANON_KEY === "string" && ANON_KEY.length > 20);
    for (const f of ["hero.jpg", "logo.png", "logo-mark.png", "icon-ig.svg", "icon-chat.svg"]) {
      const p = path.join(process.cwd(), "public", "design", f);
      check(`静态资源存在: /design/${f}`, existsSync(p) && statSync(p).size > 0);
    }

    // ---------- 2. 公开单页 ----------
    console.log("\n【2. 公开单页】");
    let r = await appFetch("/");
    check("GET / 返回 200", r.status === 200, `status=${r.status}`);
    let text = await r.text();
    check("Hero 主图渲染", text.includes("/design/hero.jpg"));
    check("顶部导航含全部链接", ["#home", "#menu", "#about", "#gallery", "#contact"].every((h) => text.includes(`href="${h}"`)));
    check("商标与图标渲染", text.includes("/design/logo.png") && text.includes("/design/icon-ig.svg") && text.includes("/design/icon-chat.svg"));
    for (const id of ["home", "menu", "about", "gallery", "contact"]) {
      check(`页面含 section id="${id}"`, text.includes(`id="${id}"`));
    }
    check("页脚渲染", text.includes("Miss Tea Tea Leuven"));

    // NEWS 条件渲染一致性：有生效公告 ⟺ 有气泡 ⟺ 有 NEWS 区 ⟺ 导航有 NEWS
    const annRead = await sb("/rest/v1/announcements?select=id&is_active=eq.true", {});
    const activeAnnCount = (annRead.json ?? []).length;
    const hasBubble = text.includes("news-bubble");
    const hasNewsSection = text.includes('id="news"');
    const hasNewsNav = text.includes('href="#news"');
    check(
      `NEWS 条件渲染一致性（生效公告 ${activeAnnCount} 条）`,
      (activeAnnCount > 0) === hasBubble &&
        (activeAnnCount > 0) === hasNewsSection &&
        (activeAnnCount > 0) === hasNewsNav,
      `bubble=${hasBubble} section=${hasNewsSection} nav=${hasNewsNav}`
    );

    // 菜单数据出现在前台
    const menuRead = await sb("/rest/v1/menu_items?select=name_en&is_available=eq.true&limit=1", {});
    const firstDrink = menuRead.json?.[0]?.name_en;
    if (firstDrink) {
      check("前台渲染数据库饮品数据", text.includes(firstDrink), `drink=${firstDrink}`);
    } else {
      skip("前台渲染数据库饮品数据（库里暂无饮品）");
    }

    // 灯箱：只要有任何内容图，页面应含灯箱标记
    const [annImg, menuImg, aboutImg, galleryImg] = await Promise.all([
      sb("/rest/v1/announcements?select=id&image_url=neq.&limit=1", {}),
      sb("/rest/v1/menu_items?select=id&image_url=neq.&limit=1", {}),
      sb("/rest/v1/about_images?select=id&limit=1", {}),
      sb("/rest/v1/gallery_photos?select=id&limit=1", {}),
    ]);
    const hasAnyImage =
      (annImg.json ?? []).length > 0 ||
      (menuImg.json ?? []).length > 0 ||
      (aboutImg.json ?? []).length > 0 ||
      (galleryImg.json ?? []).length > 0;
    check(
      "灯箱标记存在（有内容图时）",
      !hasAnyImage || text.includes("cursor-zoom-in"),
      `anyImage=${hasAnyImage}`
    );

    // ---------- 3. 路由与登录保护 ----------
    console.log("\n【3. 路由与登录保护】");
    r = await appFetch("/menu");
    const menuLoc = r.headers.get("location") ?? "";
    check("旧 /menu 重定向到 /#menu", r.status === 307 && menuLoc.includes("/#menu"), `status=${r.status}, location=${menuLoc}`);
    for (const p of ["/admin", "/admin/menu", "/admin/announcements", "/admin/about", "/admin/gallery", "/admin/messages", "/admin/settings"]) {
      r = await appFetch(p);
      const location = r.headers.get("location") ?? "";
      check(`未登录 GET ${p} → 307 跳登录页`, r.status === 307 && location.includes("/admin/login"), `status=${r.status}`);
    }
    r = await appFetch("/admin/login");
    check("GET /admin/login 返回 200", r.status === 200, `status=${r.status}`);
    r = await appFetch("/sitemap.xml");
    const sitemapText = await r.text();
    check("GET /sitemap.xml 返回 200", r.status === 200 && sitemapText.includes("<loc>"));
    r = await appFetch("/robots.txt");
    const robotsText = await r.text();
    check("GET /robots.txt 返回 200 且含 sitemap", r.status === 200 && robotsText.includes("Sitemap:"));
    r = await appFetch("/icon.svg");
    check("GET /icon.svg 返回 200", r.status === 200);
    r = await appFetch("/nonexistent-page-xyz");
    check("GET 不存在页面返回 404", r.status === 404, `status=${r.status}`);

    // ---------- 4. RLS 安全（游客） ----------
    console.log("\n【4. 行级安全 RLS（游客 anon）】");
    const anonWrites = [
      ["menu_items", { name_en: "__TEST_ANON__", name_zh: "" }],
      ["announcements", { title_en: "__TEST_ANON__", title_zh: "" }],
      ["about_entries", { title_en: "__TEST_ANON__", title_zh: "" }],
      ["gallery_photos", { image_url: "x" }],
    ];
    for (const [table, body] of anonWrites) {
      const w = await sb(`/rest/v1/${table}`, { method: "POST", body });
      check(`游客写入 ${table} 被拒绝`, w.status === 401 || w.status === 403, `status=${w.status}`);
    }
    const anonStorage = await fetch(`${SUPABASE_URL}/storage/v1/object/images/anon-test-${Date.now()}.png`, {
      method: "POST",
      headers: { apikey: ANON_KEY, "Content-Type": "image/png" },
      body: Buffer.from("test"),
      signal: AbortSignal.timeout(25000),
    });
    check("游客上传图片被拒绝", anonStorage.status >= 400, `status=${anonStorage.status}`);
    const anonMsgRead = await sb("/rest/v1/messages?select=id", {});
    check("游客读取留言表返回 200（RLS 过滤为空）", anonMsgRead.status === 200 && (anonMsgRead.json ?? []).length === 0, `status=${anonMsgRead.status}`);
    for (const table of ["menu_categories", "menu_items", "announcements", "about_entries", "about_images", "gallery_photos"]) {
      const rd = await sb(`/rest/v1/${table}?select=id&limit=1`, {});
      check(`游客可读 ${table}`, rd.status === 200, `status=${rd.status}`);
    }
    {
      // store_settings 主键是 key，没有 id 列
      const rd = await sb("/rest/v1/store_settings?select=key&limit=1", {});
      check("游客可读 store_settings", rd.status === 200, `status=${rd.status}`);
    }

    if (!hasCreds) {
      console.log("\n[提示] 未提供 TEST_OWNER_EMAIL / TEST_OWNER_PASSWORD，跳过老板登录与写路径测试。");
      console.log("       设置环境变量后重跑可获得全量测试。\n");
    } else {
      // ---------- 5. 老板登录 ----------
      console.log("\n【5. 老板登录】");
      const login = await sb("/auth/v1/token?grant_type=password", {
        method: "POST",
        body: { email: ownerEmail, password: ownerPassword },
      });
      check("Supabase 登录接口返回 200", login.status === 200, `status=${login.status}`);
      token = login.json?.access_token;
      check("获取到 access_token", typeof token === "string" && token.length > 20);
      cookieValue = token ? await buildAuthCookie(login.json) : null;
      check("会话 Cookie 可访问 /admin", cookieValue !== null);

      if (cookieValue) {
        console.log("\n【6. 后台页面（老板登录态）】");
        for (const p of ["/admin", "/admin/menu", "/admin/menu/new", "/admin/announcements", "/admin/announcements/new", "/admin/about", "/admin/gallery", "/admin/messages", "/admin/settings"]) {
          r = await appFetch(p, { cookie: `${AUTH_COOKIE}=${cookieValue}` });
          check(`登录后 GET ${p} 返回 200`, r.status === 200, `status=${r.status}`);
        }
      }

      before = await snapshot(token);

      // ---------- 7. 菜单 CRUD 往返 ----------
      console.log("\n【7. 菜单 CRUD（创建→前台可见→更新→删除）】");
      const catRes = await sb("/rest/v1/menu_categories", {
        method: "POST", token, headers: { Prefer: "return=representation" },
        body: { name_en: "__TEST_CAT__", name_zh: "测试分类", sort_order: 9999 },
      });
      const catId = catRes.json?.[0]?.id;
      check("创建测试分类成功", Boolean(catId), `status=${catRes.status}`);
      const itemRes = await sb("/rest/v1/menu_items", {
        method: "POST", token, headers: { Prefer: "return=representation" },
        body: { category_id: catId, name_en: "__TEST_DRINK__", name_zh: "测试饮品", price: 1.5, sort_order: 9999 },
      });
      const itemId = itemRes.json?.[0]?.id;
      check("创建测试饮品成功", Boolean(itemId), `status=${itemRes.status}`);
      r = await appFetch("/");
      text = await r.text();
      check("前台出现测试饮品", text.includes("__TEST_DRINK__"));
      await sb(`/rest/v1/menu_items?id=eq.${itemId}`, { method: "PATCH", token, body: { is_available: false } });
      r = await appFetch("/");
      text = await r.text();
      check("停售后前台隐藏测试饮品", !text.includes("__TEST_DRINK__"));
      await sb(`/rest/v1/menu_items?id=eq.${itemId}`, { method: "DELETE", token });
      await sb(`/rest/v1/menu_categories?id=eq.${catId}`, { method: "DELETE", token });
      let left = await sb(`/rest/v1/menu_items?select=id&id=eq.${itemId}`, { token });
      check("删除饮品与分类成功", (left.json ?? []).length === 0);

      // ---------- 8. 公告 CRUD + 前台联动 ----------
      console.log("\n【8. 公告 CRUD（含前台显示/隐藏）】");
      const annRes = await sb("/rest/v1/announcements", {
        method: "POST", token, headers: { Prefer: "return=representation" },
        body: { title_en: "__TEST_ANN__", title_zh: "测试公告", body_en: "test body", body_zh: "测试内容", is_active: true, sort_order: 9999 },
      });
      const annId = annRes.json?.[0]?.id;
      check("创建生效公告成功", Boolean(annId), `status=${annRes.status}`);
      r = await appFetch("/");
      text = await r.text();
      check("前台 NEWS 区显示测试公告", text.includes("__TEST_ANN__"));
      await sb(`/rest/v1/announcements?id=eq.${annId}`, { method: "PATCH", token, body: { is_active: false } });
      r = await appFetch("/");
      text = await r.text();
      check("停用后前台隐藏测试公告", !text.includes("__TEST_ANN__"));
      await sb(`/rest/v1/announcements?id=eq.${annId}`, { method: "DELETE", token });

      // ---------- 9. About 多图 CRUD 往返 ----------
      console.log("\n【9. About（一份 + 多图）CRUD 往返】");
      const aboutImg1 = `about-test-${Date.now()}-1.png`;
      const aboutImg2 = `about-test-${Date.now()}-2.png`;
      let up1 = await uploadStorage(token, aboutImg1);
      let up2 = await uploadStorage(token, aboutImg2);
      check("上传 About 两张测试图", up1.status === 200 && up2.status === 200, `s1=${up1.status} s2=${up2.status}`);
      const aboutRes = await sb("/rest/v1/about_entries", {
        method: "POST", token, headers: { Prefer: "return=representation" },
        body: { title_en: "__TEST_ABOUT__", title_zh: "测试关于", body_en: "hello", body_zh: "你好", sort_order: -100 },
      });
      const aboutId = aboutRes.json?.[0]?.id;
      check("创建测试 About 条目成功", Boolean(aboutId), `status=${aboutRes.status}`);
      const imgRowRes = await sb("/rest/v1/about_images", {
        method: "POST", token, headers: { Prefer: "return=representation" },
        body: [
          { about_entry_id: aboutId, image_url: `${SUPABASE_URL}/storage/v1/object/public/images/${aboutImg1}`, sort_order: 0 },
          { about_entry_id: aboutId, image_url: `${SUPABASE_URL}/storage/v1/object/public/images/${aboutImg2}`, sort_order: 1 },
        ],
      });
      check("写入两张 About 图片行成功", (imgRowRes.json ?? []).length === 2, `status=${imgRowRes.status}`);
      const anonAboutRead = await sb(`/rest/v1/about_images?select=id&about_entry_id=eq.${aboutId}`, {});
      check("游客可读 About 图片", (anonAboutRead.json ?? []).length === 2);
      r = await appFetch("/");
      text = await r.text();
      check("前台渲染 About 内容与图片", text.includes("__TEST_ABOUT__") && text.includes(`/public/images/${aboutImg1}`));
      await sb(`/rest/v1/about_entries?id=eq.${aboutId}`, { method: "DELETE", token });
      left = await sb(`/rest/v1/about_images?select=id&about_entry_id=eq.${aboutId}`, { token });
      check("删除 About 条目级联删除图片行", (left.json ?? []).length === 0);
      await deleteStorage(token, aboutImg1);
      await deleteStorage(token, aboutImg2);
      check("About 测试图从存储清理", (await storageGone(token, aboutImg1)) && (await storageGone(token, aboutImg2)));

      // ---------- 10. Gallery CRUD 往返 ----------
      console.log("\n【10. Gallery CRUD 往返】");
      const galImg = `gallery-test-${Date.now()}.png`;
      up1 = await uploadStorage(token, galImg);
      check("上传 Gallery 测试图", up1.status === 200, `status=${up1.status}`);
      const galRes = await sb("/rest/v1/gallery_photos", {
        method: "POST", token, headers: { Prefer: "return=representation" },
        body: { image_url: `${SUPABASE_URL}/storage/v1/object/public/images/${galImg}`, caption_en: "__TEST_GAL__", caption_zh: "测试照片", sort_order: 0 },
      });
      const galId = galRes.json?.[0]?.id;
      check("创建 Gallery 照片行成功", Boolean(galId), `status=${galRes.status}`);
      r = await appFetch("/");
      text = await r.text();
      check("前台渲染 Gallery 照片", text.includes("__TEST_GAL__"));
      await sb(`/rest/v1/gallery_photos?id=eq.${galId}`, { method: "DELETE", token });
      await deleteStorage(token, galImg);
      check("Gallery 测试图从存储清理", await storageGone(token, galImg));

      // ---------- 11. 留言全链路（游客留言 → 老板读取 → 删除） ----------
      console.log("\n【11. 留言全链路】");
      // RLS 只插不读：anon 插入返回 201 但响应体为空（PostgREST 无法回读该行），
      // 不能从响应里拿 id —— 改用老板 token 查 body 前缀 __TEST* 的最新一条
      const msgRes = await sb("/rest/v1/messages", {
        method: "POST",
        body: { nickname: "测试顾客", body: "__TEST_MSG__", is_read: false },
      });
      check("游客（anon）可插入留言（201，响应体为空是预期）", msgRes.status === 201, `status=${msgRes.status}`);
      const anonReadBack = await sb(`/rest/v1/messages?select=id&body=like.__TEST*`, {});
      check("anon 无法回读自己插入的留言（RLS 只插不读）", (anonReadBack.json ?? []).length === 0);
      const bossMsgRead = await sb(
        `/rest/v1/messages?select=*&body=like.__TEST*&order=created_at.desc&limit=1`,
        { token }
      );
      const msgRow = bossMsgRead.json?.[0];
      const msgId = msgRow?.id;
      check("老板可读取该留言", msgRow?.body === "__TEST_MSG__", `id=${msgId}`);
      if (cookieValue) {
        r = await appFetch("/admin/messages", { cookie: `${AUTH_COOKIE}=${cookieValue}` });
        const adminMsgText = await r.text();
        check("后台留言页渲染该留言", adminMsgText.includes("__TEST_MSG__"));
      }
      if (msgId) {
        await sb(`/rest/v1/messages?id=eq.${msgId}`, { method: "DELETE", token });
        left = await sb(`/rest/v1/messages?select=id&id=eq.${msgId}`, { token });
        check("留言删除成功", (left.json ?? []).length === 0);
      }

      // ---------- 12. 店铺设置写路径 ----------
      console.log("\n【12. 店铺设置（写回原值验证写路径）】");
      const settings = await sb("/rest/v1/store_settings?select=*", { token });
      check("读取店铺设置", settings.status === 200 && (settings.json ?? []).length >= 4, `count=${(settings.json ?? []).length}`);
      const upsert = await sb("/rest/v1/store_settings?on_conflict=key", {
        method: "POST", token, headers: { Prefer: "resolution=merge-duplicates" },
        body: settings.json ?? [],
      });
      check("写回相同设置成功", upsert.status === 200 || upsert.status === 201, `status=${upsert.status}`);
      const settingsAfter = await sb("/rest/v1/store_settings?select=*", { token });
      check(
        "设置值前后一致",
        JSON.stringify((settings.json ?? []).map((x) => [x.key, x.value_en, x.value_zh]).sort()) ===
          JSON.stringify((settingsAfter.json ?? []).map((x) => [x.key, x.value_en, x.value_zh]).sort())
      );

      // ---------- 13. Storage 往返 ----------
      console.log("\n【13. Storage 图片往返】");
      const tmpImg = `storage-test-${Date.now()}.png`;
      up1 = await uploadStorage(token, tmpImg);
      check("老板上传图片成功", up1.status === 200, `status=${up1.status}`);
      const pub = await fetch(`${SUPABASE_URL}/storage/v1/object/public/images/${tmpImg}`, { signal: AbortSignal.timeout(25000) });
      check("公开 URL 游客可访问", pub.status === 200, `status=${pub.status}`);
      await deleteStorage(token, tmpImg);
      check("删除测试图片成功", await storageGone(token, tmpImg));
    }
  } catch (e) {
    check("测试执行未崩溃", false, e?.stack ?? String(e));
  } finally {
    if (hasCreds && token) {
      await cleanup(token);
      try {
        const after = await snapshot(token);
        check("数据零变更（8 表 + Storage 前后快照一致）", before !== null && before === after);
      } catch (e) {
        check("数据零变更（快照对比）", false, e?.message ?? String(e));
      }
    }
    stopServer();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n========== 测试总结 ==========`);
  console.log(`通过: ${results.length - failed.length} / ${results.length}`);
  if (failed.length > 0) {
    console.log("失败项:");
    for (const f of failed) console.log(`  - ${f.name}`);
    process.exit(1);
  }
}

main();
