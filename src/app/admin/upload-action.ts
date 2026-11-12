"use server";

import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/format";

const MAX = 5 * 1024 * 1024;

/** Envia uma imagem para o Storage e devolve a URL pública. */
export async function uploadAsset(formData: FormData): Promise<{ url?: string; error?: string }> {
  const { db, demo } = await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file || !file.size) return { error: "Nenhum arquivo" };
  if (file.size > MAX) return { error: "Imagem acima de 5 MB" };
  if (!/^image\//.test(file.type)) return { error: "Envie um arquivo de imagem" };

  if (demo) {
    const buf = Buffer.from(await file.arrayBuffer());
    return { url: `data:${file.type};base64,${buf.toString("base64")}` };
  }

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "imagem";
  const path = `assets/${base}-${Date.now()}.${ext}`;
  const { error } = await db.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: error.message };
  return { url: db.storage.from("product-images").getPublicUrl(path).data.publicUrl };
}
