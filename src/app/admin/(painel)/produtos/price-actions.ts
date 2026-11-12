"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

export async function adjustPrices(input: { pct: number; categoryId: string; round90: boolean; includeCompare: boolean }): Promise<{ ok: boolean; count?: number; error?: string }> {
  const { db } = await requireAdmin();
  const pct = Number(input.pct);
  if (!Number.isFinite(pct) || pct === 0 || pct <= -90 || pct > 500) return { ok: false, error: "Percentual inválido" };
  const { data, error } = await db.rpc("adjust_prices", {
    pct,
    cat: input.categoryId || null,
    round90: input.round90,
    include_compare: input.includeCompare,
  });
  if (error) return { ok: false, error: /adjust_prices/.test(error.message) ? "Rode o schema.sql atualizado no Supabase para liberar essa função." : error.message };
  revalidatePath("/", "layout");
  return { ok: true, count: Number(data) };
}
