"use client";

import { useState } from "react";

// 可点击图片：点击弹出子窗口放大查看（点击遮罩或 ✕ 关闭）
export default function LightboxImage({
  src,
  alt,
  className = "",
  imgClassName = "",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`放大查看：${alt}`}
        className={`block w-full cursor-zoom-in text-left ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={`h-full w-full object-cover ${imgClassName}`} />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-6"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setOpen(false)}
            className="absolute right-5 top-5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-[22px] text-white hover:bg-white/30"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
