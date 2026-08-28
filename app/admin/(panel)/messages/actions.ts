"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSupabase, str } from "@/lib/admin";
import { deleteImage } from "@/lib/images";

export async function toggleMessageRead(formData: FormData) {
  const supabase = await getAdminSupabase();
  const id = str(formData, "id");
  const isRead = formData.get("is_read") === "true";
  const { error } = await supabase
    .from("messages")
    .update({ is_read: !isRead })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/messages");
  redirect("/admin/messages?done=updated");
}

export async function deleteMessage(formData: FormData) {
  const supabase = await getAdminSupabase();
  const id = str(formData, "id");
  const { data: rows } = await supabase.from("messages").select("image_url").eq("id", id);
  const row = (rows ?? [])[0] as { image_url: string } | undefined;
  if (row?.image_url) await deleteImage(supabase, row.image_url);
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/messages");
  redirect("/admin/messages?done=deleted");
}
