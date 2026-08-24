import Link from "next/link";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/admin" className="text-sm text-[#8b4513] underline">
        ← 返回后台首页
      </Link>
      <h1 className="mt-4 text-2xl font-bold">🏪 店铺信息</h1>
      <div className="mt-6 rounded-[20px] bg-white p-8 text-center text-[#8a7363] shadow-[0_5px_15px_#ddd]">
        建设中（T4.4）
      </div>
    </div>
  );
}
