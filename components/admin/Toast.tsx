"use client";

import { useEffect, useState } from "react";

// 操作结果提示：出现在页面顶部居中，2.5 秒后自动消失
export default function Toast({ text }: { text: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed left-1/2 top-6 z-[120] -translate-x-1/2 rounded-full bg-[#3d7a3a] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)]">
      {text}
    </div>
  );
}

export const DONE_TEXT: Record<string, string> = {
  saved: "已保存 ✓",
  deleted: "已删除 ✓",
  updated: "已更新 ✓",
  sorted: "排序已保存 ✓",
};
