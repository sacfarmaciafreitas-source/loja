import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Sem Supabase configurado a loja roda com dados de exemplo. */
export const isDemo = !url || !anon;

let publicClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/** Leitura pública (catálogo), respeita RLS. */
export function db() {
  if (isDemo) throw new Error("Supabase não configurado");
  if (!publicClient) publicClient = createClient(url!, anon!, { auth: { persistSession: false } });
  return publicClient;
}

/** Acesso total, somente no servidor (pedidos, webhooks, admin). */
export function dbAdmin() {
  if (isDemo || !service) throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente");
  if (!adminClient) adminClient = createClient(url!, service, { auth: { persistSession: false } });
  return adminClient;
}

/** Cliente com a sessão do usuário logado (login do admin). */
export async function dbSession() {
  const store = await cookies();
  return createServerClient(url!, anon!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list: { name: string; value: string; options?: Parameters<typeof store.set>[2] }[]) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // chamado a partir de Server Component: ignorar
        }
      },
    },
  });
}
