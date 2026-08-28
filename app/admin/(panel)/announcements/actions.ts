"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSupabase, num, str } from "@/lib/admin";
import { deleteImage, imageFromForm, uploadImage } from "@/lib/images";

export type ActionState = { error?: string } | null;

// 活动图片统一放 announcement-images/ 分区
const IMAGE_FOLDER = "announcement-images";

async function nextSortOrder(): Promise<number> {
  const supabase = await getAdminSupabase();
  const { count } = await supabase
    .from("announcements")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

export async function createAnnouncement(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await getAdminSupabase();
  const imageFile = imageFromForm(formData);
  let imageUrl = "";
  if (imageFile) {
    try {
      imageUrl = await uploadImage(supabase, imageFile, IMAGE_FOLDER);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "图片上传失败" };
    }
  }
  const { error } = await supabase.from("announcements").insert({
    title_en: str(formData, "title_en"),
    title_zh: str(formData, "title_zh"),
    body_en: str(formData, "body_en"),
    body_zh: str(formData, "body_zh"),
    image_url: imageUrl,
    sort_order: num(formData, "sort_order") ?? (await nextSortOrder()),
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  redirect("/admin/announcements?done=saved");
}

export async function updateAnnouncement(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await getAdminSupabase();
  const imageFile = imageFromForm(formData);
  const removeImage = formData.get("remove_image") === "on";
  const oldImageUrl = str(formData, "current_image");
  let imageUrl = oldImageUrl;
  if (imageFile) {
    try {
      imageUrl = await uploadImage(supabase, imageFile, IMAGE_FOLDER);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "图片上传失败" };
    }
    if (oldImageUrl) await deleteImage(supabase, oldImageUrl);
  } else if (removeImage && oldImageUrl) {
    await deleteImage(supabase, oldImageUrl);
    imageUrl = "";
  }
  const { error } = await supabase
    .from("announcements")
    .update({
      title_en: str(formData, "title_en"),
      title_zh: str(formData, "title_zh"),
      body_en: str(formData, "body_en"),
      body_zh: str(formData, "body_zh"),
      image_url: imageUrl,
      sort_order: num(formData, "sort_order") ?? 0,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  redirect("/admin/announcements?done=saved");
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
  redirect("/admin/announcements?done=updated");
}

export async function deleteAnnouncement(formData: FormData) {
  const supabase = await getAdminSupabase();
  const id = str(formData, "id");
  const { data: rows } = await supabase
    .from("announcements")
    .select("image_url")
    .eq("id", id);
  const row = (rows ?? [])[0] as { image_url: string } | undefined;
  if (row?.image_url) await deleteImage(supabase, row.image_url);
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/announcements");
  redirect("/admin/announcements?done=deleted");
}

export async function reorderAnnouncements(ids: string[]) {
  const supabase = await getAdminSupabase();
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("announcements")
      .update({ sort_order: i })
      .eq("id", ids[i]);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/announcements");
}
