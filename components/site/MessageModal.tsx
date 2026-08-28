"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitMessage } from "@/app/actions/messages";

const inputCls =
  "mt-1 w-full rounded-xl border border-[#e5c5a8] bg-[#fff7ef] px-3 py-2.5 text-[15px] text-brown outline-none focus:border-brown-deep";

// 留言频率限制：5 分钟内最多 3 条（浏览器本地记录，防重复刷屏）
const RATE_KEY = "mtt-message-timestamps";
const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX = 3;
const rateLimitText = "5 分钟内最多留言 3 次，请稍后再试";

function loadTimestamps(): number[] {
  try {
    const raw = window.localStorage.getItem(RATE_KEY);
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === "number") : [];
  } catch {
    return [];
  }
}

function recentMessageCount(): number {
  const now = Date.now();
  const kept = loadTimestamps().filter((t) => now - t < RATE_WINDOW_MS);
  try {
    window.localStorage.setItem(RATE_KEY, JSON.stringify(kept));
  } catch {}
  return kept.length;
}

function recordMessageSent() {
  const arr = loadTimestamps();
  arr.push(Date.now());
  try {
    window.localStorage.setItem(RATE_KEY, JSON.stringify(arr));
  } catch {}
}

// 表单独立成子组件：弹窗关闭即卸载，重新打开时 useActionState 状态归零，
// 修复“发送过一次后无法再发第二条”的问题
function MessageForm({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(submitMessage, { ok: false });
  const [rateError, setRateError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // 打开弹窗时若已超过 5 分钟 3 条的限制，直接提示
  useEffect(() => {
    if (recentMessageCount() >= RATE_MAX) setRateError(rateLimitText);
  }, []);

  // 提交成功后记录时间，停留 1.2 秒再关闭，给顾客看到“已发送”
  useEffect(() => {
    if (state.ok) {
      recordMessageSent();
      const t = setTimeout(() => {
        formRef.current?.reset();
        onClose();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [state.ok, onClose]);

  if (state.ok) {
    return (
      <p className="font-cn mt-6 rounded-xl bg-[#f2e0c8] px-4 py-3 text-center text-[15px] text-brown">
        留言已发送，谢谢！☺️
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        setRateError("");
        if (recentMessageCount() >= RATE_MAX) {
          e.preventDefault();
          setRateError(rateLimitText);
        }
      }}
      className="mt-4"
    >
      {state.error && (
        <p className="font-cn rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {rateError && (
        <p className="font-cn rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          {rateError}
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
      <p className="font-cn mt-2 text-center text-xs text-[#a4704c]">
        温馨提示：5 分钟内最多发送 3 条留言
      </p>
    </form>
  );
}

export default function MessageModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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

        <MessageForm onClose={onClose} />
      </div>
    </div>
  );
}
