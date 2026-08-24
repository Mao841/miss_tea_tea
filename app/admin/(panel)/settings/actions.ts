"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase, str } from "@/lib/admin";

export async function saveSettings(formData: FormData) {
  const supabase = await getAdminSupabase();
  const keys = ["hero_slogan", "address", "opening_hours", "instagram"];
  const rows = keys.map((key) => ({
    key,
    value_en: str(formData, `${key}_en`),
    value_zh: str(formData, `${key}_zh`),
  }));
  const { error } = await supabase
    .from("store_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}
