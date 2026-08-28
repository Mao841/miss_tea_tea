"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export type SortableItem = { id: string };

export type MoveControls = {
  onUp: () => void;
  onDown: () => void;
  upDisabled: boolean;
  downDisabled: boolean;
};

// 排序列表：每条带 ▲上移 / ▼下移 按钮，点击后自动保存（兼容手机与所有浏览器）
export default function SortableList<T extends SortableItem>({
  items,
  render,
  onReorder,
  className = "space-y-4",
}: {
  items: T[];
  render: (item: T, controls: MoveControls) => ReactNode;
  onReorder: (ids: string[]) => Promise<void> | void;
  className?: string;
}) {
  const [list, setList] = useState<T[]>(items);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function move(index: number, dir: -1 | 1) {
    if (busy) return;
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const prev = list;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    setList(next);
    setBusy(true);
    try {
      await onReorder(next.map((item) => item.id));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setList(prev);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      {(busy || saved) && (
        <p className="font-cn col-span-full rounded-full bg-[#3d7a3a]/10 px-4 py-1.5 text-center text-sm font-semibold text-[#3d7a3a]">
          {busy ? "保存排序中…" : "排序已保存 ✓"}
        </p>
      )}
      {list.map((item, index) => (
        <div key={item.id} className="contents">
          {render(item, {
            onUp: () => move(index, -1),
            onDown: () => move(index, 1),
            upDisabled: busy || index === 0,
            downDisabled: busy || index === list.length - 1,
          })}
        </div>
      ))}
    </div>
  );
}

// ▲▼ 上移/下移按钮组
export function UpDownControls({ controls }: { controls: MoveControls }) {
  const btn =
    "flex h-6 w-7 items-center justify-center rounded-md border border-[#d8bda6] bg-white text-[11px] text-[#8b4513] hover:bg-[#8b4513] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#8b4513]";
  return (
    <span className="flex flex-col gap-1">
      <button type="button" aria-label="上移" title="上移" disabled={controls.upDisabled} onClick={controls.onUp} className={btn}>
        ▲
      </button>
      <button type="button" aria-label="下移" title="下移" disabled={controls.downDisabled} onClick={controls.onDown} className={btn}>
        ▼
      </button>
    </span>
  );
}
