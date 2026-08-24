"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSupabase, num, str } from "@/lib/admin";

export type ActionState = { error?: string } | null;

export async function createItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await getAdminSupabase();
  const { error } = await supabase.from("menu_items").insert({
    category_id: str(formData, "category_id") || null,
    name_en: str(formData, "name_en"),
    name_zh: str(formData, "name_zh"),
    description_en: str(formData, "description_en"),
    description_zh: str(formData, "description_zh"),
    price: num(formData, "price"),
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
  const { error } = await supabase
    .from("menu_items")
    .update({
      category_id: str(formData, "category_id") || null,
      name_en: str(formData, "name_en"),
      name_zh: str(formData, "name_zh"),
      description_en: str(formData, "description_en"),
      description_zh: str(formData, "description_zh"),
      price: num(formData, "price"),
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
  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", str(formData, "id"));
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
