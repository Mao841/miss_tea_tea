"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminSupabase, num, str } from "@/lib/admin";

export type ActionState = { error?: string } | null;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function getPublicUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${path}`;
}

function imagePathFromUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/images/";
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

async function uploadImage(supabase: SupabaseClient, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("只能上传图片文件（JPG/PNG/WebP 等）");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("图片不能超过 5MB");
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `item-images/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("images")
    .upload(path, await file.arrayBuffer(), { contentType: file.type });
  if (error) throw new Error(`图片上传失败：${error.message}`);
  return getPublicUrl(path);
}

async function deleteImage(supabase: SupabaseClient, url: string) {
  const path = imagePathFromUrl(url);
  if (!path) return;
  await supabase.storage.from("images").remove([path]);
}

function imageFromForm(formData: FormData): File | null {
  const value = formData.get("image");
  return value instanceof File && value.size > 0 ? value : null;
}

export async function createItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await getAdminSupabase();
  const imageFile = imageFromForm(formData);
  let imageUrl = "";
  if (imageFile) {
    try {
      imageUrl = await uploadImage(supabase, imageFile);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "图片上传失败" };
    }
  }
  const { error } = await supabase.from("menu_items").insert({
    category_id: str(formData, "category_id") || null,
    name_en: str(formData, "name_en"),
    name_zh: str(formData, "name_zh"),
    description_en: str(formData, "description_en"),
    description_zh: str(formData, "description_zh"),
    price: num(formData, "price"),
    image_url: imageUrl,
    sort_order: num(formData, "sort_order") ?? 0,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/menu");
  redirect("/admin/menu");
}

export async function updateItem(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await getAdminSupabase();
  const imageFile = imageFromForm(formData);
  const oldImageUrl = str(formData, "current_image");
  let imageUrl = oldImageUrl;
  if (imageFile) {
    try {
      imageUrl = await uploadImage(supabase, imageFile);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "图片上传失败" };
    }
    if (oldImageUrl) await deleteImage(supabase, oldImageUrl);
  }
  const { error } = await supabase
    .from("menu_items")
    .update({
      category_id: str(formData, "category_id") || null,
      name_en: str(formData, "name_en"),
      name_zh: str(formData, "name_zh"),
      description_en: str(formData, "description_en"),
      description_zh: str(formData, "description_zh"),
      price: num(formData, "price"),
      image_url: imageUrl,
      sort_order: num(formData, "sort_order") ?? 0,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/menu");
  redirect("/admin/menu");
}

export async function toggleItem(formData: FormData) {
  const supabase = await getAdminSupabase();
  const id = str(formData, "id");
  const isAvailable = formData.get("is_available") === "true";
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: !isAvailable })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/menu");
}

export async function deleteItem(formData: FormData) {
  const supabase = await getAdminSupabase();
  const id = str(formData, "id");
  const { data: rows } = await supabase
    .from("menu_items")
    .select("image_url")
    .eq("id", id);
  const row = (rows ?? [])[0] as { image_url: string } | undefined;
  if (row?.image_url) await deleteImage(supabase, row.image_url);
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/menu");
}

export async function createCategory(formData: FormData) {
  const supabase = await getAdminSupabase();
  const { error } = await supabase.from("menu_categories").insert({
    name_en: str(formData, "name_en"),
    name_zh: str(formData, "name_zh"),
    sort_order: num(formData, "sort_order") ?? 0,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/menu");
}

export async function updateCategory(formData: FormData) {
  const supabase = await getAdminSupabase();
  const { error } = await supabase
    .from("menu_categories")
    .update({
      name_en: str(formData, "name_en"),
      name_zh: str(formData, "name_zh"),
      sort_order: num(formData, "sort_order") ?? 0,
    })
    .eq("id", str(formData, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/menu");
}

export async function deleteCategory(formData: FormData) {
  const supabase = await getAdminSupabase();
  const { error } = await supabase
    .from("menu_categories")
    .delete()
    .eq("id", str(formData, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/menu");
}
