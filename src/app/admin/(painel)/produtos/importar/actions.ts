"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/format";

export type ImportRow = Record<string, string>;

const num = (v?: string) => {
  if (!v) return null;
  const s = v.replace(/[R$\s]/g, "");
  const n = Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s);
  return Number.isFinite(n) ? n : null;
};
const bool = (v: string | undefined, def: boolean) => (v ? ["1", "sim", "s", "true", "yes", "x"].includes(v.trim().toLowerCase()) : def);

/** Importa um lote de linhas. Atualiza quando o slug (URL) já existe. */
export async function importProducts(rows: ImportRow[]): Promise<{ ok: number; errors: string[] }> {
  const { db } = await requireAdmin();
  const errors: string[] = [];

  // categorias: aceita slug ou nome; cria as que não existem
  const { data: cats } = await db.from("categories").select("id,slug,name");
  const catMap = new Map<string, string>();
  (cats ?? []).forEach((c) => {
    catMap.set(c.slug, c.id);
    catMap.set(slugify(c.name), c.id);
  });
  const wanted = [...new Set(rows.map((r) => slugify(r.categoria || "")).filter(Boolean))].filter((s) => !catMap.has(s));
  if (wanted.length) {
    const names = new Map(rows.filter((r) => r.categoria).map((r) => [slugify(r.categoria), r.categoria.trim()]));
    const { data: created } = await db
      .from("categories")
      .insert(wanted.map((s, i) => ({ slug: s, name: names.get(s) ?? s, position: (cats?.length ?? 0) + i })))
      .select("id,slug");
    (created ?? []).forEach((c) => catMap.set(c.slug, c.id));
  }

  const records = rows
    .map((r, i) => {
      const name = (r.nome || "").trim();
      const price = num(r.preco);
      if (!name || price == null) {
        errors.push(`Linha ${i + 1}: nome e preço são obrigatórios`);
        return null;
      }
      return {
        name,
        slug: slugify(r.slug || name),
        price,
        compare_at_price: num(r.preco_de),
        stock: Math.max(0, Math.floor(num(r.estoque) ?? 0)),
        brand: r.marca?.trim() || null,
        sku: r.sku?.trim() || null,
        gtin: r.gtin?.replace(/\D/g, "") || null,
        description: r.descricao?.trim() || "",
        image_url: r.imagem_url?.trim() || null,
        category_id: r.categoria ? catMap.get(slugify(r.categoria)) ?? null : null,
        featured: bool(r.destaque, false),
        active: bool(r.ativo, true),
      };
    })
    .filter(Boolean);

  // dedup dentro do lote
  const unique = [...new Map(records.map((r) => [r!.slug, r!])).values()];
  if (unique.length) {
    const { error } = await db.from("products").upsert(unique, { onConflict: "slug" });
    if (error) return { ok: 0, errors: [...errors, error.message] };
  }
  revalidatePath("/", "layout");
  return { ok: unique.length, errors };
}
