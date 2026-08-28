"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSupabase, num, str } from "@/lib/admin";
import { deleteImage, uploadImage } from "@/lib/images";

export type ActionState = { error?: string } | null;

const IMAGE_FOLDER = "about-images";

async function uploadAllImages(
  supabase: Awaited<ReturnType<typeof getAdminSupabase>>,
  formData: FormData
): Promise<string[] | { error: string }> {
  const files = formData.getAll("images").filter((v): v is File => v instanceof File && v.size > 0);
  const urls: string[] = [];
  for (const file of files) {
    try {
      urls.push(await uploadImage(supabase, file, IMAGE_FOLDER));
    } catch (e) {
      return { error: e instanceof Error ? e.message : "图片上传失败" };
    }
  }
  return urls;
}

async function nextSortOrder(): Promise<number> {
  const supabase = await getAdminSupabase();
  const { count } = await supabase
    .from("about_entries")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

export async function createAboutEntry(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await getAdminSupabase();
  const uploaded = await uploadAllImages(supabase, formData);
  if ("error" in uploaded) return { error: uploaded.error };

  const { data: entry, error } = await supabase
    .from("about_entries")
    .insert({
      title_en: str(formData, "title_en"),
      title_zh: str(formData, "title_zh"),
      body_en: str(formData, "body_en"),
      body_zh: str(formData, "body_zh"),
      sort_order: num(formData, "sort_order") ?? (await nextSortOrder()),
    })
    .select("id")
    .single();
  if (error || !entry) return { error: error?.message ?? "保存失败" };

  if (uploaded.length > 0) {
    const { error: imgError } = await supabase.from("about_images").insert(
      uploaded.map((url, i) => ({
        about_entry_id: entry.id as string,
        image_url: url,
        sort_order: i,
      }))
    );
    if (imgError) return { error: imgError.message };
  }
  revalidatePath("/admin/about");
  redirect("/admin/about?done=saved");
}

export async function updateAboutEntry(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await getAdminSupabase();
  const uploaded = await uploadAllImages(supabase, formData);
  if ("error" in uploaded) return { error: uploaded.error };

  const { error } = await supabase
    .from("about_entries")
    .update({
      title_en: str(formData, "title_en"),
      title_zh: str(formData, "title_zh"),
      body_en: str(formData, "body_en"),
      body_zh: str(formData, "body_zh"),
      sort_order: num(formData, "sort_order") ?? 0,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  if (uploaded.length > 0) {
    const { data: maxRow } = await supabase
      .from("about_images")
      .select("sort_order")
      .eq("about_entry_id", id)
      .order("sort_order", { ascending: false })
      .limit(1);
    const base = ((maxRow?.[0] as { sort_order: number } | undefined)?.sort_order ?? -1) + 1;
    const { error: imgError } = await supabase.from("about_images").insert(
      uploaded.map((url, i) => ({
        about_entry_id: id,
        image_url: url,
        sort_order: base + i,
      }))
    );
    if (imgError) return { error: imgError.message };
  }
  revalidatePath("/admin/about");
  redirect("/admin/about?done=saved");
}

export async function deleteAboutEntry(formData: FormData) {
  const supabase = await getAdminSupabase();
  const id = str(formData, "id");
  const { data: images } = await supabase.from("about_images").select("image_url").eq("about_entry_id", id);
  for (const img of (images ?? []) as { image_url: string }[]) {
    await deleteImage(supabase, img.image_url);
  }
  const { data: rows } = await supabase.from("about_entries").select("image_url").eq("id", id);
  const row = (rows ?? [])[0] as { image_url: string } | undefined;
  if (row?.image_url) await deleteImage(supabase, row.image_url);
  const { error } = await supabase.from("about_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/about");
  redirect("/admin/about?done=deleted");
}

export async function deleteAboutImage(formData: FormData) {
  const supabase = await getAdminSupabase();
  const id = str(formData, "image_id");
  const entryId = str(formData, "entry_id");
  const { data: rows } = await supabase.from("about_images").select("image_url").eq("id", id);
  const row = (rows ?? [])[0] as { image_url: string } | undefined;
  if (row?.image_url) await deleteImage(supabase, row.image_url);
  const { error } = await supabase.from("about_images").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/about");
  redirect(entryId ? `/admin/about/${entryId}/edit?done=deleted` : "/admin/about?done=deleted");
}

export async function reorderAboutEntries(ids: string[]) {
  const supabase = await getAdminSupabase();
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("about_entries")
      .update({ sort_order: i })
      .eq("id", ids[i]);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/about");
}
