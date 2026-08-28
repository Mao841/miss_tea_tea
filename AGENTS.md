<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# 项目环境备忘（会话记忆，2026-08 交接后积累）

## Git 推送网络问题（重点）
- 本机环境：老板 VPN 为**代理模式**，Windows 系统代理 = `127.0.0.1:7890`（端口可能随 VPN 客户端变化，先查 `Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings'` 的 ProxyServer）
- **git 默认不走 Windows 系统代理**：浏览器能打开 github.com 但 `git push` 报 "Failed to connect to github.com port 443" / "Recv failure: Connection was reset" 时，就是这个原因，不是 GitHub 挂了
- 解决办法（按命令临时指定代理，不改全局配置）：
  ```
  git -c http.proxy=http://127.0.0.1:7890 -c https.proxy=http://127.0.0.1:7890 push origin main
  ```
- 推送前可先用 `Invoke-WebRequest -Uri https://api.github.com -Proxy http://127.0.0.1:7890` 验证代理连通
- 仓库：https://github.com/Mao841/miss_tea_tea.git（main 分支）；push 成功后 Vercel 自动部署 miss-tea-tea.vercel.app，约 1-2 分钟生效
- 测试凭证（Supabase 登录、老板邮箱/密码）只存在会话里传递，**禁止写入任何项目文件**，测试完提醒老板改密码

## 构建与本地服务器
- PowerShell 里 npm 被执行策略拦：一律用 `cmd /c "npm run build"` / `cmd /c "npm run start"` 形式
- 改组件代码必须重建：先停 3000 端口（`Get-NetTCPConnection -LocalPort 3000` 找 PID，`taskkill /PID X /F /T` 杀整棵树——cmd/npm 父进程杀了 node 子进程会变孤儿继续占端口），再 build 再后台 start
- **public/ 静态资源（如 hero.jpg）是 next start 实时读盘的**：改图片无需重建，直接替换文件即可生效（用文件哈希对比验证）
- 构建产物在 .next；测试脚本 test-all.mjs 自起 3210 端口测试服务器，别和 3000 预览服务器混淆
- 验证前台渲染注意：**客户端组件（如留言弹窗）的内容不出现在 SSR HTML 里**，grep HTML 验证不到，要用无头浏览器真实渲染验证

## Supabase API 调用
- 不要用 pwsh 拼 JSON 调 Supabase（引号被破坏、Set-Content 写 BOM 导致 PGRST102）；一律写 Node .mjs 脚本用 fetch
- .env.local 只有 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY（值带双引号，Node 里 .Trim 或 replace 去引号）
- RLS 事实：messages 表 anon **只插不读**（插入返回 201 空响应体是预期，拿不到 id）；回查要用老板 token；PostgREST 通配符用 `*`（`_` 是单字符通配）
- 8 张表：menu_categories/menu_items/announcements/store_settings/about_entries/about_images/gallery_photos/messages

## 浏览器自动化与截图
- 无头 Chrome：`C:\Program Files\Google\Chrome\Application\chrome.exe`，每次跑要给独立 `--user-data-dir`（%TEMP% 下），否则不生成文件
- e2e 脚本：scripts/e2e-screenshots.mjs（输出 test-screenshots/01~12，需 TEST_OWNER_EMAIL/TEST_OWNER_PASSWORD 环境变量登录后台）
- 看图必须用 vision 工具（vision_describe/vision_crop/vision_ground 等）；给用户看图必须用 vision_present；vision 偶发返回空内容，重试一次即可
- 老板手机参考尺寸：412x915 CSS（截图 920x2047）
