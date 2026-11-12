"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/format";

export async function updateCategory(id: string, data: { name: string; slug: string; blurb: string; image_url: string }) {
  const { db } = await requireAdmin();
  const { error } = await db
    .from("categories")
    .update({ name: data.name.trim(), slug: slugify(data.slug || data.name), blurb: data.blurb.trim() || null, image_url: data.image_url || null })
    .eq("id", id);
  revalidatePath("/", "layout");
  return error ? { error: error.message } : { ok: true };
}

export async function moveCategory(id: string, dir: -1 | 1) {
  const { db } = await requireAdmin();
  const { data } = await db.from("categories").select("id,position").order("position").order("name");
  const list = data ?? [];
  const i = list.findIndex((c) => c.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await Promise.all(list.map((c, k) => db.from("categories").update({ position: k }).eq("id", c.id)));
  revalidatePath("/", "layout");
}

export async function deleteCategory(id: string) {
  const { db } = await requireAdmin();
  // os produtos da categoria ficam sem categoria (não são apagados)
  const { error } = await db.from("categories").delete().eq("id", id);
  revalidatePath("/", "layout");
  return error ? { error: error.message } : { ok: true };
}
