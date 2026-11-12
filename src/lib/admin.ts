import "server-only";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { dbSession, isDemo } from "./supabase";

/** No modo demo o painel só abre com DEMO_ADMIN=1 (para testes locais). */
export const demoAdmin = isDemo && process.env.DEMO_ADMIN === "1";

/** Garante que quem acessa é admin. Retorna o cliente Supabase com a sessão. */
export async function requireAdmin(): Promise<{ db: SupabaseClient; user: { email?: string }; demo: boolean }> {
  if (demoAdmin) return { db: null as unknown as SupabaseClient, user: { email: "modo demo" }, demo: true };
  if (isDemo) redirect("/admin/login?demo=1");
  const db = await dbSession();
  const { data } = await db.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: ok } = await db.rpc("is_admin");
  if (!ok) redirect("/admin/login?erro=sem-permissao");
  return { db, user: data.user, demo: false };
}
