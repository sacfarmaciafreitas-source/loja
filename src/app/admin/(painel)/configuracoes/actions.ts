"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { getSettings, saveSecrets, saveSettings } from "@/lib/settings";
import type { Secrets, Settings } from "@/lib/settings-types";
import { sectionBySlug, type Field } from "./sections";

function setPath(obj: Record<string, unknown>, path: string[], value: unknown) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    cur[path[i]] = { ...((cur[path[i]] as object) ?? {}) };
    cur = cur[path[i]] as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value;
}

function coerce(f: Field, v: unknown): unknown {
  if (f.type === "number") return Number(String(v ?? "0").replace(",", ".")) || 0;
  if (f.type === "toggle") return Boolean(v);
  if (f.type === "checks") return Array.isArray(v) ? v.map(String) : [];
  if (f.type === "list") {
    const arr = Array.isArray(v) ? v : [];
    return arr.map((it) => Object.fromEntries(f.item.map((sub) => [sub.key, coerce(sub, (it as Record<string, unknown>)?.[sub.key ?? ""])])));
  }
  if (f.type === "pages") {
    const o = (v ?? {}) as Record<string, { title?: string; body?: string }>;
    return Object.fromEntries(Object.entries(o).filter(([, p]) => p?.title || p?.body).map(([k, p]) => [k, { title: String(p.title ?? ""), body: String(p.body ?? "") }]));
  }
  return typeof v === "string" ? v.trim() : v == null ? "" : String(v);
}

export async function saveSection(slug: string, values: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const section = sectionBySlug(slug);
  if (!section) return { ok: false, error: "Seção inválida" };

  try {
    const current = await getSettings();
    const patch: Record<string, unknown> = {};
    const secrets: Partial<Secrets> = {};

    for (const f of section.fields) {
      if (!f.key || f.type === "info") continue;
      if (!(f.key in values)) continue;
      const v = coerce(f, values[f.key]);
      const [top, ...rest] = f.key.split(".");

      if (top === "secrets") {
        // campo de chave vazio = manter a chave atual
        if (f.type === "secret" && !v) continue;
        secrets[rest[0] as keyof Secrets] = v as string;
        continue;
      }
      if (!rest.length) {
        patch[top] = v;
        continue;
      }
      if (!(top in patch)) patch[top] = structuredClone(current[top as keyof Settings]);
      setPath(patch[top] as Record<string, unknown>, rest, v);
    }

    if (Object.keys(patch).length) await saveSettings(patch as Partial<Settings>);
    if (Object.keys(secrets).length) await saveSecrets(secrets);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e instanceof Error ? e.message : "Erro ao salvar" };
  }
}
