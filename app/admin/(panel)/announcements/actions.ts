"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSupabase, num, str } from "@/lib/admin";

export type ActionState = { error?: string } | null;

export async function createAnnouncement(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await getAdminSupabase();
  const { error } = await supabase.from("announcements").insert({
    title_en: str(formData, "title_en"),
    title_zh: str(formData, "title_zh"),
    body_en: str(formData, "body_en"),
    body_zh: str(formData, "body_zh"),
    sort_order: num(formData, "sort_order") ?? 0,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  redirect("/admin/announcements");
}

export async function updateAnnouncement(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await getAdminSupabase();
  const { error } = await supabase
    .from("announcements")
    .update({
      title_en: str(formData, "title_en"),
      title_zh: str(formData, "title_zh"),
      body_en: str(formData, "body_en"),
      body_zh: str(formData, "body_zh"),
      sort_order: num(formData, "sort_order") ?? 0,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  redirect("/admin/announcements");
}

export async function toggleAnnouncement(formData: FormData) {
  const supabase = await getAdminSupabase();
  const id = str(formData, "id");
  const isActive = formData.get("is_active") === "true";
  const { error } = await supabase
    .from("announcements")
    .update({ is_active: !isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/announcements");
}

export async function deleteAnnouncement(formData: FormData) {
  const supabase = await getAdminSupabase();
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", str(formData, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/announcements");
}
