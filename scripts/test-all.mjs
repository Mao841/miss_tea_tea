#!/usr/bin/env node
// ============================================================
// Miss Tea Tea 全功能端到端测试脚本（零数据变更保证）
//
// 原理：
//   1. 启动本地生产服务器（next start）
//   2. 逐项验证：公开页面 / 登录保护 / 老板登录 / 后台页面 /
//      RLS 安全 / 菜单·公告 CRUD / 店铺设置 / 图片上传
//   3. 所有测试数据（分类/饮品/公告/图片）创建后立即验证并删除
//   4. 测试前后对 4 张表 + Storage 做快照对比，必须完全一致
//
// 运行方式：
//   $env:TEST_OWNER_EMAIL="..." ; $env:TEST_OWNER_PASSWORD="..."
//   node scripts/test-all.mjs
// ============================================================
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
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

function loadEnv(file) {
  const env = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const envLocal = loadEnv(path.join(process.cwd(), ".env.local"));
const SUPABASE_URL = envLocal.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = envLocal.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const REF = SUPABASE_URL.replace("https://", "").split(".")[0];
const AUTH_COOKIE = `sb-${REF}-auth-token`;

const ownerEmail = process.env.TEST_OWNER_EMAIL;
const ownerPassword = process.env.TEST_OWNER_PASSWORD;

if (!ownerEmail || !ownerPassword) {
  console.error("缺少 TEST_OWNER_EMAIL / TEST_OWNER_PASSWORD 环境变量");
  process.exit(1);
}

async function sb(pathname, { method = "GET", token, body, headers } = {}) {
  const res = await fetch(`${SUPABASE_URL}${pathname}`, {
    method,
    redirect: "manual",
    signal: AbortSignal.timeout(20000),
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
    signal: AbortSignal.timeout(20000),
    headers: cookie ? { cookie } : {},
  });
}

async function startServer() {
  serverProc = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)],
    { stdio: "ignore", cwd: process.cwd() }
  );
  for (let i = 0; i < 60; i++) {
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

// 测试前后快照（4 张表 + Storage 文件列表）
// 注：忽略 created_at/updated_at 自动时间戳，只对比内容字段
async function snapshot(token) {
  const out = {};
  for (const table of ["menu_categories", "menu_items", "announcements", "store_settings"]) {
    const r = await sb(`/rest/v1/${table}?select=*`, { token });
    out[table] = (r.json ?? [])
      .map((row) => {
        const { created_at, updated_at, ...rest } = row;
        return JSON.stringify(rest);
      })
      .sort();
  }
  const listRes = await sb("/storage/v1/object/list/images", {
    method: "POST",
    token,
    body: { prefix: "", limit: 1000 },
  });
  out.storage = (listRes.json ?? []).map((f) => f.name).sort();
  return JSON.stringify(out);
}

// 构造会话 Cookie（尝试两种编码，返回能通过鉴权的那个）
async function buildAuthCookie(session) {
  const candidates = [
    JSON.stringify(session),
    encodeURIComponent(JSON.stringify(session)),
  ];
  for (const value of candidates) {
    const r = await appFetch("/admin", { cookie: `${AUTH_COOKIE}=${value}` });
    if (r.status === 200) return value;
  }
  return null;
}

async function cleanup(token) {
  if (!token) return;
  // 按命名前缀兜底清理（正常路径已逐个删除）
  await sb(`/rest/v1/menu_items?name_en=like.__TEST*`, { method: "DELETE", token });
  await sb(`/rest/v1/menu_categories?name_en=like.__TEST*`, { method: "DELETE", token });
  await sb(`/rest/v1/announcements?title_en=like.__TEST*`, { method: "DELETE", token });
}

// ------------------------------------------------------------
async function main() {
  let token = null;
  let before = null;
  try {
    await startServer();
    console.log(`== 服务器已启动: ${BASE}\n`);

    // ---------- 1. 公开页面 ----------
    console.log("【1. 公开页面】");
    let r = await appFetch("/");
    check("GET / 返回 200", r.status === 200, `status=${r.status}`);
    let text = await r.text();
    check("首页含站点名", text.includes("Miss Tea Tea"));
    check("首页含数据库数据（饮品名）", text.includes("Brown Sugar Boba Milk"));
    check("首页右上角有 Login 按钮", text.includes('href="/admin/login"'));

    r = await appFetch("/menu");
    check("GET /menu 返回 200", r.status === 200, `status=${r.status}`);
    text = await r.text();
    check("菜单页含分类数据", text.includes("Milk Tea"));
    check("菜单页含饮品数据", text.includes("Matcha Latte"));

    r = await appFetch("/sitemap.xml");
    check("GET /sitemap.xml 返回 200", r.status === 200, `status=${r.status}`);
    text = await r.text();
    check("sitemap 含页面地址", text.includes("<loc>"));

    r = await appFetch("/robots.txt");
    check("GET /robots.txt 返回 200", r.status === 200, `status=${r.status}`);
    text = await r.text();
    check("robots 含 sitemap 引用", text.includes("Sitemap:"));

    r = await appFetch("/admin/login");
    check("GET /admin/login 返回 200", r.status === 200, `status=${r.status}`);

    // ---------- 2. 登录保护 ----------
    console.log("\n【2. 登录保护（未登录访问后台）】");
    for (const p of ["/admin", "/admin/menu", "/admin/announcements", "/admin/settings"]) {
      r = await appFetch(p);
      const location = r.headers.get("location") ?? "";
      check(`未登录 GET ${p} → 307 跳登录页`, r.status === 307 && location.includes("/admin/login"), `status=${r.status}, location=${location}`);
    }

    // ---------- 3. 老板登录 ----------
    console.log("\n【3. 老板登录】");
    const login = await sb("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: { email: ownerEmail, password: ownerPassword },
    });
    check("Supabase 登录接口返回 200", login.status === 200, `status=${login.status}`);
    check(
      "登录账号是老板邮箱",
      login.json?.user?.email === ownerEmail,
      `email=${login.json?.user?.email}`
    );
    token = login.json?.access_token;
    check("获取到 access_token", typeof token === "string" && token.length > 20);

    const cookieValue = token ? await buildAuthCookie(login.json) : null;
    check("会话 Cookie 可访问 /admin（200）", cookieValue !== null);

    if (cookieValue) {
      console.log("\n【4. 后台页面（老板登录态）】");
      for (const p of ["/admin", "/admin/menu", "/admin/announcements", "/admin/settings", "/admin/menu/new"]) {
        r = await appFetch(p, { cookie: `${AUTH_COOKIE}=${cookieValue}` });
        check(`登录后 GET ${p} 返回 200`, r.status === 200, `status=${r.status}`);
      }
    }

    // ---------- 5. RLS 安全 ----------
    console.log("\n【5. 行级安全（RLS）】");
    const anonWrite = await sb("/rest/v1/menu_items", {
      method: "POST",
      body: { name_en: "anon 越权测试", name_zh: "" },
    });
    check(
      "游客（anon）写入被拒绝（401/403）",
      anonWrite.status === 401 || anonWrite.status === 403,
      `status=${anonWrite.status}`
    );

    const anonStorage = await fetch(
      `${SUPABASE_URL}/storage/v1/object/images/anon-test-${Date.now()}.png`,
      {
        method: "POST",
        headers: { apikey: ANON_KEY, "Content-Type": "image/png" },
        body: Buffer.from("test"),
        signal: AbortSignal.timeout(20000),
      }
    );
    check("游客（anon）上传图片被拒绝（>=400）", anonStorage.status >= 400, `status=${anonStorage.status}`);

    const ownerRead = await sb("/rest/v1/menu_items?select=id&limit=1", { token });
    check("老板读取数据 200", ownerRead.status === 200, `status=${ownerRead.status}`);

    // ---------- 快照（测试开始前） ----------
    before = await snapshot(token);

    // ---------- 6. 菜单 CRUD 往返 ----------
    console.log("\n【6. 菜单 CRUD（创建→验证→删除）】");
    const catRes = await sb("/rest/v1/menu_categories", {
      method: "POST",
      token,
      headers: { Prefer: "return=representation" },
      body: { name_en: "__TEST_CAT__", name_zh: "测试分类", sort_order: 9999 },
    });
    const catId = catRes.json?.[0]?.id;
    check("创建测试分类成功", Boolean(catId), `status=${catRes.status}`);

    const itemRes = await sb("/rest/v1/menu_items", {
      method: "POST",
      token,
      headers: { Prefer: "return=representation" },
      body: { category_id: catId, name_en: "__TEST_ITEM__", name_zh: "测试饮品", price: 1.5, sort_order: 9999 },
    });
    const itemId = itemRes.json?.[0]?.id;
    check("创建测试饮品成功", Boolean(itemId), `status=${itemRes.status}`);

    let read = await sb(`/rest/v1/menu_items?select=*&id=eq.${itemId}`, { token });
    check("读取饮品字段正确", read.json?.[0]?.name_en === "__TEST_ITEM__" && read.json?.[0]?.price === 1.5);

    r = await appFetch("/menu");
    text = await r.text();
    check("前台菜单页出现测试饮品", text.includes("__TEST_ITEM__"));

    await sb(`/rest/v1/menu_items?id=eq.${itemId}`, {
      method: "PATCH",
      token,
      body: { price: 2.5, is_available: false },
    });
    read = await sb(`/rest/v1/menu_items?select=*&id=eq.${itemId}`, { token });
    check("更新饮品（价格/停售）生效", read.json?.[0]?.price === 2.5 && read.json?.[0]?.is_available === false);

    r = await appFetch("/menu");
    text = await r.text();
    check("停售后前台隐藏测试饮品", !text.includes("__TEST_ITEM__"));

    await sb(`/rest/v1/menu_items?id=eq.${itemId}`, { method: "PATCH", token, body: { is_available: true } });
    r = await appFetch("/menu");
    text = await r.text();
    check("恢复上架后前台重新出现", text.includes("__TEST_ITEM__"));

    await sb(`/rest/v1/menu_items?id=eq.${itemId}`, { method: "DELETE", token });
    read = await sb(`/rest/v1/menu_items?select=*&id=eq.${itemId}`, { token });
    check("删除饮品成功", (read.json ?? []).length === 0);

    await sb(`/rest/v1/menu_categories?id=eq.${catId}`, { method: "DELETE", token });
    read = await sb(`/rest/v1/menu_categories?select=*&id=eq.${catId}`, { token });
    check("删除测试分类成功", (read.json ?? []).length === 0);

    r = await appFetch("/menu");
    text = await r.text();
    check("前台菜单页不再含测试饮品", !text.includes("__TEST_ITEM__"));

    // ---------- 7. 公告 CRUD 往返 ----------
    console.log("\n【7. 公告 CRUD】");
    const annRes = await sb("/rest/v1/announcements", {
      method: "POST",
      token,
      headers: { Prefer: "return=representation" },
      body: { title_en: "__TEST_ANNOUNCEMENT__", title_zh: "测试公告", body_en: "test", body_zh: "测试", sort_order: 9999 },
    });
    const annId = annRes.json?.[0]?.id;
    check("创建测试公告成功", Boolean(annId), `status=${annRes.status}`);

    await sb(`/rest/v1/announcements?id=eq.${annId}`, {
      method: "PATCH",
      token,
      body: { body_en: "updated", is_active: false },
    });
    read = await sb(`/rest/v1/announcements?select=*&id=eq.${annId}`, { token });
    check("更新公告生效", read.json?.[0]?.body_en === "updated" && read.json?.[0]?.is_active === false);

    await sb(`/rest/v1/announcements?id=eq.${annId}`, { method: "DELETE", token });
    read = await sb(`/rest/v1/announcements?select=*&id=eq.${annId}`, { token });
    check("删除测试公告成功", (read.json ?? []).length === 0);

    // ---------- 8. 店铺设置（写同值，无净变更） ----------
    console.log("\n【8. 店铺设置（写回原值验证写路径）】");
    const settings = await sb("/rest/v1/store_settings?select=*", { token });
    check("读取店铺设置（4 项）", settings.status === 200 && (settings.json ?? []).length === 4, `count=${(settings.json ?? []).length}`);
    const upsert = await sb("/rest/v1/store_settings?on_conflict=key", {
      method: "POST",
      token,
      headers: { Prefer: "resolution=merge-duplicates" },
      body: settings.json ?? [],
    });
    check("写回相同设置成功", upsert.status === 200 || upsert.status === 201, `status=${upsert.status}`);
    const settingsAfter = await sb("/rest/v1/store_settings?select=*", { token });
    check(
      "设置值前后一致",
      JSON.stringify((settings.json ?? []).map((x) => [x.key, x.value_en, x.value_zh]).sort()) ===
        JSON.stringify((settingsAfter.json ?? []).map((x) => [x.key, x.value_en, x.value_zh]).sort())
    );

    // ---------- 9. 图片上传 ----------
    console.log("\n【9. 图片上传（Storage）】");
    const filePath = `test-${Date.now()}.png`;
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );
    const up = await fetch(`${SUPABASE_URL}/storage/v1/object/images/${filePath}`, {
      method: "POST",
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "image/png" },
      body: png,
      signal: AbortSignal.timeout(20000),
    });
    check("老板上传图片成功", up.status === 200, `status=${up.status}`);

    const pub = await fetch(`${SUPABASE_URL}/storage/v1/object/public/images/${filePath}`, {
      signal: AbortSignal.timeout(20000),
    });
    check("公开 URL 可访问（游客可看图）", pub.status === 200, `status=${pub.status}`);

    const del = await fetch(`${SUPABASE_URL}/storage/v1/object/images/${filePath}`, {
      method: "DELETE",
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(20000),
    });
    check("删除测试图片成功", del.status === 200, `status=${del.status}`);

    // 删除验证：用文件列表（权威、无 CDN 缓存），而非公开 URL
    let listGone = null;
    for (let i = 0; i < 4; i++) {
      const list = await sb("/storage/v1/object/list/images", {
        method: "POST",
        token,
        body: { prefix: filePath, limit: 10 },
      });
      listGone = (list.json ?? []).length === 0;
      if (listGone) break;
      await sleep(2000);
    }
    check("删除后存储中不再存在该图片", listGone === true);
  } catch (e) {
    check("测试执行未崩溃", false, e.message);
  } finally {
    // ---------- 清理 + 快照对比 ----------
    await cleanup(token);
    try {
      const after = await snapshot(token);
      check("数据零变更（4 表 + Storage 前后快照完全一致）", before !== null && before === after);
    } catch (e) {
      check("数据零变更（快照对比）", false, e.message);
    }
    stopServer();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n========== 测试总结 ==========`);
  console.log(`通过: ${results.length - failed.length} / ${results.length}`);
  if (failed.length > 0) {
    console.log(`失败项:`);
    for (const f of failed) console.log(`  - ${f.name}`);
    process.exit(1);
  }
}

main();
