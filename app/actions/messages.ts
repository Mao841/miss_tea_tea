"use server";

import { createClient } from "@/lib/supabase/server";
import { imageFromForm, uploadImage } from "@/lib/images";

export type MessageState = { ok: boolean; error?: string };

// 顾客留言：文字 + 图片（至少其一），昵称可选；游客只能插入（RLS 已配置）
export async function submitMessage(
  _prev: MessageState,
  formData: FormData
): Promise<MessageState> {
  const nickname = String(formData.get("nickname") ?? "").trim().slice(0, 50);
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  const file = imageFromForm(formData);

  if (!body && !file) {
    return { ok: false, error: "请写点内容，或上传一张图片" };
  }

  const supabase = await createClient();
  let imageUrl = "";
  if (file) {
    try {
      imageUrl = await uploadImage(supabase, file, "message-images");
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "图片上传失败" };
    }
  }

  const { error } = await supabase
    .from("messages")
    .insert({ nickname, body, image_url: imageUrl });
  if (error) {
    console.error("留言保存失败:", error.message);
    return { ok: false, error: "发送失败，请稍后再试" };
  }
  return { ok: true };
}
