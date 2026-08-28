#!/usr/bin/env node
// ============================================================
// 真实浏览器自动化截图脚本（Chrome DevTools Protocol）
// 模拟真实用户操作：点灯箱放大、打开聊天弹窗、登录后台、截图各页面
//
// 运行：
//   node scripts/e2e-screenshots.mjs
//   （可选环境变量 TEST_OWNER_EMAIL / TEST_OWNER_PASSWORD 以登录后台）
//   截图输出到 ./test-screenshots/
// ============================================================
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const DEBUG_PORT = 9222;
const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "test-screenshots");
const EMAIL = process.env.TEST_OWNER_EMAIL ?? "";
const PASSWORD = process.env.TEST_OWNER_PASSWORD ?? "";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(OUT_DIR, { recursive: true });

let chromeProc = null;
let ws = null;
let msgId = 0;
const pending = new Map();

async function launchChrome() {
  chromeProc = spawn(
    CHROME,
    [
      `--remote-debugging-port=${DEBUG_PORT}`,
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${path.join(process.env.TEMP, `mtt-e2e-${Date.now()}`)}`,
      "--window-size=1350,900",
      "about:blank",
    ],
    { stdio: "ignore" }
  );
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://localhost:${DEBUG_PORT}/json/version`);
      if (r.ok) return;
    } catch {}
    await sleep(500);
  }
  throw new Error("Chrome DevTools 启动超时");
}

async function connect() {
  for (let i = 0; i < 20; i++) {
    try {
      const r = await fetch(`http://localhost:${DEBUG_PORT}/json`);
      const targets = await r.json();
      const page = targets.find((t) => t.type === "page");
      if (page) {
        ws = new WebSocket(page.webSocketDebuggerUrl);
        await new Promise((res, rej) => {
          ws.onopen = res;
          ws.onerror = rej;
        });
        ws.onmessage = (ev) => {
          const msg = JSON.parse(ev.data);
          if (msg.id && pending.has(msg.id)) {
            const { resolve, reject } = pending.get(msg.id);
            pending.delete(msg.id);
            msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
          }
        };
        return;
      }
    } catch {}
    await sleep(500);
  }
  throw new Error("无法连接页面目标");
}

function cdp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const r = await cdp("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.exceptionDetails) {
    throw new Error(r.exceptionDetails.text ?? "evaluate 失败");
  }
  return r.result?.value;
}

async function navigate(url, waitMs = 2800) {
  await cdp("Page.navigate", { url });
  await sleep(waitMs);
}

async function screenshot(file, { width = 1350, height = 900, mobile = false, fullPage = false } = {}) {
  await cdp("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
  });
  const res = await cdp("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: fullPage,
  });
  writeFileSync(path.join(OUT_DIR, file), Buffer.from(res.data, "base64"));
  console.log(`  → ${file}`);
}

async function main() {
  try {
    await launchChrome();
    await connect();
    console.log("== 浏览器已启动\n");

    // ---------- 1. 首页（桌面） ----------
    console.log("【1. 首页】");
    await navigate(`${BASE}/`);
    await screenshot("01-home.png");
    await screenshot("02-home-fullpage.png", { height: 900, fullPage: true });

    // ---------- 2. 灯箱：点击第一张可放大图片 ----------
    console.log("【2. 灯箱放大】");
    await navigate(`${BASE}/`);
    const clicked = await evaluate(`(() => {
      const btn = document.querySelector(".cursor-zoom-in");
      if (btn) { btn.click(); return true; }
      return false;
    })()`);
    if (clicked) {
      await sleep(1200);
      await screenshot("03-lightbox.png");
    } else {
      console.log("  （当前没有可点击的内容图片，跳过）");
    }

    // ---------- 3. 聊天留言弹窗 ----------
    console.log("【3. 留言弹窗】");
    await navigate(`${BASE}/`);
    const opened = await evaluate(`(() => {
      const btn = document.querySelector('button[aria-label="给老板留言"]');
      if (btn) { btn.click(); return true; }
      return false;
    })()`);
    if (opened) {
      await sleep(800);
      await screenshot("04-chat-modal.png");
    }

    // ---------- 4. 移动端首页 ----------
    console.log("【4. 移动端 375px】");
    await navigate(`${BASE}/`);
    await screenshot("05-mobile-375.png", { width: 375, height: 812, mobile: true });

    // ---------- 5. 登录后台（有凭证时） ----------
    if (EMAIL && PASSWORD) {
      console.log("【5. 老板登录 + 后台页面】");
      await navigate(`${BASE}/admin/login`);
      await evaluate(`(() => {
        const setVal = (el, v) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(el, v);
          el.dispatchEvent(new Event("input", { bubbles: true }));
        };
        const inputs = document.querySelectorAll("input");
        if (inputs.length >= 2) {
          setVal(inputs[0], ${JSON.stringify(EMAIL)});
          setVal(inputs[1], ${JSON.stringify(PASSWORD)});
        }
        const form = document.querySelector("form");
        if (form) form.requestSubmit();
        return true;
      })()`);
      await sleep(4500);
      await screenshot("06-admin-dashboard.png", { fullPage: true });

      const adminPages = [
        ["/admin/menu", "07-admin-menu.png"],
        ["/admin/announcements", "08-admin-news.png"],
        ["/admin/about", "09-admin-about.png"],
        ["/admin/gallery", "10-admin-gallery.png"],
        ["/admin/messages", "11-admin-messages.png"],
        ["/admin/settings", "12-admin-settings.png"],
      ];
      for (const [p, file] of adminPages) {
        await navigate(`${BASE}${p}`);
        await screenshot(file, { fullPage: true });
      }
    } else {
      console.log("（未提供 TEST_OWNER_EMAIL / TEST_OWNER_PASSWORD，跳过后台登录截图）");
    }

    console.log(`\n== 完成，截图输出目录: ${OUT_DIR}`);
  } catch (e) {
    console.error("截图脚本失败:", e?.stack ?? String(e));
    process.exitCode = 1;
  } finally {
    try {
      chromeProc?.kill();
    } catch {}
    try {
      ws?.close();
    } catch {}
  }
}

main();
