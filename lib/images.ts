import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// 生成 Storage 公开图片地址（bucket: images）
export function getPublicUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${path}`;
}

// 从完整 URL 反推 Storage 内路径，用于删除旧图；非本站图片返回 null
export function imagePathFromUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/images/";
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

// 从表单取出上传文件（无文件/空文件返回 null）
export function imageFromForm(formData: FormData): File | null {
  const value = formData.get("image");
  return value instanceof File && value.size > 0 ? value : null;
}

// 校验并上传图片，返回公开 URL；folder 用于不同业务分区（如 item-images / announcement-images）
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  folder = "item-images"
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("只能上传图片文件（JPG/PNG/WebP 等）");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("图片不能超过 5MB");
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("images")
    .upload(path, await file.arrayBuffer(), { contentType: file.type });
  if (error) throw new Error(`图片上传失败：${error.message}`);
  return getPublicUrl(path);
}

// 删除 Storage 中的图片（按 URL 反推路径）
export async function deleteImage(supabase: SupabaseClient, url: string) {
  const path = imagePathFromUrl(url);
  if (!path) return;
  await supabase.storage.from("images").remove([path]);
}
