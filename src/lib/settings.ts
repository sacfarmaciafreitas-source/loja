import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { defaultSettings } from "@/store.config";
import { dbAdmin, db, isDemo } from "./supabase";
import type { Secrets, Settings } from "./settings-types";

const g = globalThis as unknown as { __demoSettings?: Partial<Settings>; __demoSecrets?: Partial<Secrets> };

/** Mescla o salvo no banco por cima dos padrões, seção por seção. */
function merge(saved: Partial<Settings> | null | undefined): Settings {
  const out = structuredClone(defaultSettings) as Settings;
  if (!saved) return out;
  for (const k of Object.keys(saved) as (keyof Settings)[]) {
    const v = saved[k];
    if (v === undefined || v === null) continue;
    const base = out[k];
    if (Array.isArray(v) || typeof v !== "object" || Array.isArray(base)) (out as Record<string, unknown>)[k] = v;
    else (out as Record<string, unknown>)[k] = { ...(base as object), ...(v as object) };
  }
  return out;
}

const loadSettings = unstable_cache(
  async () => {
    const { data } = await db().from("store_settings").select("data").eq("id", 1).maybeSingle();
    return (data?.data ?? null) as Partial<Settings> | null;
  },
  ["store-settings"],
  { tags: ["settings"], revalidate: 300 },
);

export async function getSettings(): Promise<Settings> {
  if (isDemo) return merge(g.__demoSettings);
  try {
    return merge(await loadSettings());
  } catch (e) {
    console.error("settings", e);
    return merge(null);
  }
}

/** Salva uma ou mais seções (substitui a seção inteira). Só chamar depois de requireAdmin. */
export async function saveSettings(patch: Partial<Settings>) {
  if (isDemo) {
    g.__demoSettings = { ...(g.__demoSettings ?? {}), ...patch };
    return;
  }
  const db = dbAdmin();
  const { data } = await db.from("store_settings").select("data").eq("id", 1).maybeSingle();
  const next = { ...((data?.data as object) ?? {}), ...patch };
  const { error } = await db.from("store_settings").upsert({ id: 1, data: next, updated_at: new Date().toISOString() });
  if (error) throw error;
  revalidateTag("settings");
}

export async function getSecrets(): Promise<Secrets> {
  const envDefaults: Secrets = {
    provider: process.env.PAYMENT_PROVIDER || "mock",
    apiUrl: process.env.PAYMENT_API_URL || "",
    apiKey: process.env.PAYMENT_API_KEY || "",
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || "",
  };
  if (isDemo) return { ...envDefaults, ...(g.__demoSecrets ?? {}) };
  try {
    const { data } = await dbAdmin().from("store_secrets").select("data").eq("id", 1).maybeSingle();
    const saved = (data?.data ?? {}) as Partial<Secrets>;
    // campos vazios no banco caem para a variável de ambiente
    return Object.fromEntries(Object.entries(envDefaults).map(([k, v]) => [k, saved[k as keyof Secrets] || v])) as Secrets;
  } catch {
    return envDefaults;
  }
}

export async function saveSecrets(patch: Partial<Secrets>) {
  if (isDemo) {
    g.__demoSecrets = { ...(g.__demoSecrets ?? {}), ...patch };
    return;
  }
  const db = dbAdmin();
  const { data } = await db.from("store_secrets").select("data").eq("id", 1).maybeSingle();
  const { error } = await db.from("store_secrets").upsert({ id: 1, data: { ...((data?.data as object) ?? {}), ...patch } });
  if (error) throw error;
}
