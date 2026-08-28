// 临时清理：删除测试留下的留言行
import { readFileSync } from "node:fs";
import path from "node:path";

function loadEnv(file) {
  const env = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, "");
  }
  return env;
}

const env = loadEnv(path.join(process.cwd(), ".env.local"));
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const loginRes = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
  method: "POST",
  signal: AbortSignal.timeout(20000),
  headers: { apikey: KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    email: process.env.TEST_OWNER_EMAIL,
    password: process.env.TEST_OWNER_PASSWORD,
  }),
});
const loginText = await loginRes.text();
console.log("登录状态:", loginRes.status, loginText.slice(0, 160));
const token = JSON.parse(loginText).access_token;
if (!token) throw new Error("登录失败");

// 找出测试残留留言
const list = await fetch(
  `${URL}/rest/v1/messages?select=id,body&body=like.__*`,
  {
    signal: AbortSignal.timeout(20000),
    headers: { apikey: KEY, Authorization: `Bearer ${token}` },
  }
);
const rows = await list.json();
console.log("测试残留留言:", rows.map((r) => r.body));

for (const row of rows) {
  const del = await fetch(`${URL}/rest/v1/messages?id=eq.${row.id}`, {
    method: "DELETE",
    signal: AbortSignal.timeout(20000),
    headers: { apikey: KEY, Authorization: `Bearer ${token}` },
  });
  console.log(`删除 ${row.body}: ${del.status}`);
}
