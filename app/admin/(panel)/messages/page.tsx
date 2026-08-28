import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { MessageRow } from "@/lib/types";
import { deleteMessage, toggleMessageRead } from "./actions";
import DeleteButton from "@/components/admin/DeleteButton";
import Toast, { DONE_TEXT } from "@/components/admin/Toast";

const btnOutline =
  "rounded-full border border-[#8b4513] px-3 py-1 text-xs text-[#8b4513] hover:bg-[#8b4513] hover:text-white";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  const { done } = await searchParams;
  // 留言表对游客只允许 INSERT，必须用带老板会话的服务端客户端读取
  const supabase = await createClient();
  const { data: rows } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
  const messages = (rows ?? []) as MessageRow[];
  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      {done && <Toast text={DONE_TEXT[done] ?? "已完成 ✓"} />}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-[#8b4513] underline">
            ← 返回后台首页
          </Link>
          <h1 className="mt-2 text-2xl font-bold">💬 顾客留言</h1>
        </div>
        {unreadCount > 0 && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-600">
            {unreadCount} 条未读
          </span>
        )}
      </div>

      <section className="mt-6 space-y-4">
        {messages.length === 0 && (
          <div className="rounded-[20px] bg-white p-8 text-center text-[#8a7363] shadow-[0_5px_15px_#ddd]">
            还没有顾客留言。顾客在网站右上角点聊天气泡即可留言。
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-[20px] bg-white p-5 shadow-[0_5px_15px_#ddd] ${
              message.is_read ? "" : "ring-2 ring-[#f2a65a]"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <p className="min-w-0 flex-1 font-bold">
                {message.nickname || "匿名顾客"}
                <span className="ml-2 text-xs font-normal text-[#8a7363]">
                  {new Date(message.created_at).toLocaleString("zh-CN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </p>
              {!message.is_read && (
                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-600">
                  未读
                </span>
              )}
            </div>
            {message.body && (
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#4b2e20]">
                {message.body}
              </p>
            )}
            {message.image_url && (
              <Image
                src={message.image_url}
                alt="留言图片"
                width={200}
                height={200}
                className="mt-3 h-40 w-40 rounded-xl object-cover"
              />
            )}
            <div className="mt-4 flex items-center gap-2">
              <form action={toggleMessageRead}>
                <input type="hidden" name="id" value={message.id} />
                <input type="hidden" name="is_read" value={String(message.is_read)} />
                <button className={btnOutline}>
                  {message.is_read ? "标记未读" : "标记已读"}
                </button>
              </form>
              <form action={deleteMessage}>
                <input type="hidden" name="id" value={message.id} />
                <DeleteButton />
              </form>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
