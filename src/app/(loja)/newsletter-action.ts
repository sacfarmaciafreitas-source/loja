"use server";

import { dbAdmin, isDemo } from "@/lib/supabase";

export async function subscribeNewsletter(email: string): Promise<{ ok: boolean; message: string }> {
  const e = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return { ok: false, message: "E-mail inválido." };
  if (isDemo) return { ok: true, message: "Cadastro feito! (modo demo)" };
  const { error } = await dbAdmin().from("newsletter_subscribers").upsert({ email: e }, { onConflict: "email", ignoreDuplicates: true });
  if (error) return { ok: false, message: "Não foi possível cadastrar agora." };
  return { ok: true, message: "Pronto! Você vai receber nossas novidades." };
}
