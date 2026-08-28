"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

// 图片选择 + 保存前预览：选图后立即显示缩略图，点右上角 ✕ 可移除
export default function ImagePicker({
  name,
  multiple = false,
  required = false,
  label,
}: {
  name: string;
  multiple?: boolean;
  required?: boolean;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    urls.forEach((u) => URL.revokeObjectURL(u));
    setFiles(list);
    setUrls(list.map((f) => URL.createObjectURL(f)));
  }

  function remove(index: number) {
    const nextFiles = files.filter((_, i) => i !== index);
    setFiles(nextFiles);
    setUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    // 同步回原生 input，保证表单提交只携带剩余文件
    const dt = new DataTransfer();
    nextFiles.forEach((f) => dt.items.add(f));
    if (inputRef.current) {
      inputRef.current.files = dt.files;
    }
  }

  return (
    <div className="mt-4 block text-sm font-medium text-[#4b2e20]">
      {label}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        multiple={multiple}
        required={required}
        onChange={handleChange}
        className="mt-1 w-full text-sm text-[#4b2e20] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#8b4513] file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-[#7a3d11]"
      />
      {urls.length > 0 && (
        <div className={`mt-3 grid gap-3 ${multiple ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-3"}`}>
          {urls.map((url, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`预览 ${i + 1}`}
                className="aspect-square w-full rounded-xl border-2 border-[#e5d5c5] object-cover"
              />
              <button
                type="button"
                aria-label="删除这张预览图"
                title="移除"
                onClick={() => remove(i)}
                className="absolute -right-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-red-600 text-[12px] leading-none text-white shadow hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
