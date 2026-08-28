"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitMessage } from "@/app/actions/messages";

const inputCls =
  "mt-1 w-full rounded-xl border border-[#e5c5a8] bg-[#fff7ef] px-3 py-2.5 text-[15px] text-brown outline-none focus:border-brown-deep";

export default function MessageModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(submitMessage, { ok: false });
  const formRef = useRef<HTMLFormElement>(null);

  // 提交成功后停留 1.2 秒再关闭，给顾客看到“已发送”
  useEffect(() => {
    if (state.ok && open) {
      const t = setTimeout(() => {
        formRef.current?.reset();
        onClose();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [state.ok, open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-5"
      onClick={onClose}
    >
      <div
        className="paper-bg w-full max-w-md rounded-[24px] border-2 border-brown p-6 shadow-[0_10px_40px_rgba(75,46,32,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[24px] font-bold text-brown">
            Leave a message · 留言
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="cursor-pointer rounded-full px-2.5 py-0.5 text-[22px] leading-none text-brown hover:text-brown-deep"
          >
            ✕
          </button>
        </div>
        <p className="font-cn mt-1 text-sm text-[#8a5a3c]">
          有话想对老板说？留个言吧（昵称可选）
        </p>

        {state.ok ? (
          <p className="font-cn mt-6 rounded-xl bg-[#f2e0c8] px-4 py-3 text-center text-[15px] text-brown">
            留言已发送，谢谢！☺️
          </p>
        ) : (
          <form ref={formRef} action={formAction} className="mt-4">
            {state.error && (
              <p className="font-cn rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {state.error}
              </p>
            )}
            <label className="mt-3 block text-sm font-medium text-brown">
              昵称（可选）
              <input
                name="nickname"
                maxLength={50}
                placeholder="匿名顾客"
                className={inputCls}
              />
            </label>
            <label className="mt-3 block text-sm font-medium text-brown">
              留言内容
              <textarea
                name="body"
                rows={4}
                maxLength={2000}
                placeholder="写下你想说的话…"
                className={inputCls}
              />
            </label>
            <label className="mt-3 block text-sm font-medium text-brown">
              图片（可选，不超过 5MB）
              <input
                type="file"
                name="image"
                accept="image/*"
                className="mt-1 w-full text-sm text-brown file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-brown-deep file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-brown-dark"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="font-cn mt-5 w-full cursor-pointer rounded-full bg-brown-deep py-3 text-[16px] text-white hover:bg-brown-dark disabled:opacity-50"
            >
              {pending ? "发送中…" : "发送留言"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
