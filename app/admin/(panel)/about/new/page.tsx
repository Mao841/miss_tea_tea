import Link from "next/link";
import AboutForm from "@/components/admin/AboutForm";
import { createAboutEntry } from "../actions";

export default function NewAboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/admin/about" className="text-sm text-[#8b4513] underline">
        ← 返回 About 管理
      </Link>
      <h1 className="font-display mt-2 text-2xl font-bold">创建 About</h1>
      <div className="mt-6 rounded-[20px] bg-white p-6 shadow-[0_5px_15px_#ddd]">
        <AboutForm
          action={createAboutEntry}
          initial={{ title_en: "", title_zh: "", body_en: "", body_zh: "" }}
        />
      </div>
    </div>
  );
}
