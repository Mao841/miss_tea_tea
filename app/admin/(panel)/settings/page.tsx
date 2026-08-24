import Link from "next/link";
import { getSupabase } from "@/lib/supabase/public";
import type { StoreSettingRow } from "@/lib/types";
import { saveSettings } from "./actions";

const settingsConfig = [
  { key: "hero_slogan", label: "Hero 标语", hint: "首页大标题下方的标语" },
  { key: "address", label: "地址", hint: "显示在「📍 Visit Us」区块" },
  { key: "opening_hours", label: "营业时间", hint: "如 Mon-Sun: 11:00 - 21:00" },
  { key: "instagram", label: "Instagram", hint: "如 @MissTeaTea" },
];

const inputCls =
  "mt-1 w-full rounded-xl border border-[#e5d5c5] bg-[#fff7ef] px-3 py-2 text-sm outline-none focus:border-[#8b4513]";
const btnPrimary =
  "mt-8 w-full rounded-full bg-[#8b4513] py-3 text-white hover:bg-[#7a3d11]";

export default async function AdminSettingsPage() {
  const supabase = getSupabase();
  const { data: rows } = await supabase.from("store_settings").select("*");
  const settings = new Map(
    ((rows ?? []) as StoreSettingRow[]).map((row) => [row.key, row])
  );

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/admin" className="text-sm text-[#8b4513] underline">
        ← 返回后台首页
      </Link>
      <h1 className="mt-2 text-2xl font-bold">🏪 店铺信息</h1>
      <p className="mt-1 text-sm text-[#8a7363]">
        修改后保存，前台立即生效（留空的中文会不显示）
      </p>

      <form action={saveSettings} className="mt-6 space-y-6">
        {settingsConfig.map(({ key, label, hint }) => {
          const row = settings.get(key);
          return (
            <div key={key} className="rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd]">
              <p className="font-bold">{label}</p>
              <p className="text-xs text-[#8a7363]">{hint}</p>
              <label className="mt-3 block text-sm font-medium text-[#4b2e20]">
                英文
                <input
                  name={`${key}_en`}
                  required
                  defaultValue={row?.value_en ?? ""}
                  className={inputCls}
                />
              </label>
              <label className="mt-3 block text-sm font-medium text-[#4b2e20]">
                中文
                <input
                  name={`${key}_zh`}
                  defaultValue={row?.value_zh ?? ""}
                  className={inputCls}
                />
              </label>
            </div>
          );
        })}
        <button className={btnPrimary}>保存全部</button>
      </form>
    </div>
  );
}
