"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSupabase, num, str } from "@/lib/admin";
import { deleteImage, imageFromForm, uploadImage } from "@/lib/images";

export async function createPhoto(formData: FormData) {
  const supabase = await getAdminSupabase();
  const imageFile = imageFromForm(formData);
  if (!imageFile) {
    throw new Error("请选择一张图片");
  }
  const { count } = await supabase
    .from("gallery_photos")
    .select("id", { count: "exact", head: true });
  const imageUrl = await uploadImage(supabase, imageFile, "gallery-images");
  const { error } = await supabase.from("gallery_photos").insert({
    image_url: imageUrl,
    caption_en: str(formData, "caption_en"),
    caption_zh: str(formData, "caption_zh"),
    sort_order: num(formData, "sort_order") ?? (count ?? 0),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery?done=saved");
}

export async function deletePhoto(formData: FormData) {
  const supabase = await getAdminSupabase();
  const id = str(formData, "id");
  const { data: rows } = await supabase.from("gallery_photos").select("image_url").eq("id", id);
  const row = (rows ?? [])[0] as { image_url: string } | undefined;
  if (row?.image_url) await deleteImage(supabase, row.image_url);
  const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery?done=deleted");
}

export async function reorderPhotos(ids: string[]) {
  const supabase = await getAdminSupabase();
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("gallery_photos")
      .update({ sort_order: i })
      .eq("id", ids[i]);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/gallery");
}
