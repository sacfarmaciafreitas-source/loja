import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getCategories } from "@/lib/data";
import { PROVIDERS } from "@/lib/payments";
import { POLICY_SLUGS, defaultPolicies } from "@/lib/policies";
import { getSecrets, getSettings } from "@/lib/settings";
import { FONTS } from "@/lib/settings-types";
import { SettingsForm } from "../settings-form";
import { sectionBySlug, type Field } from "../sections";

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}

export default async function SettingsSection({ params }: { params: Promise<{ secao: string }> }) {
  const { secao } = await params;
  await requireAdmin();
  const section = sectionBySlug(secao);
  if (!section) notFound();

  const [settings, secrets, categories] = await Promise.all([getSettings(), getSecrets(), getCategories().catch(() => [])]);
  const values: Record<string, unknown> = {};
  const secretSet: Record<string, boolean> = {};
  for (const f of section.fields as Field[]) {
    if (!f.key) continue;
    if (f.key.startsWith("secrets.")) {
      const k = f.key.split(".")[1] as keyof typeof secrets;
      if (f.type === "secret") {
        values[f.key] = "";
        secretSet[f.key] = Boolean(secrets[k]);
      } else values[f.key] = secrets[k];
    } else values[f.key] = getPath(settings, f.key);
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const defaults = defaultPolicies(settings);

  return (
    <SettingsForm
      section={section}
      initial={values}
      secretSet={secretSet}
      options={{
        fonts: FONTS.map((f) => ({ value: f, label: f })),
        categories: [{ value: "", label: "Nenhuma" }, ...categories.map((c) => ({ value: c.slug, label: c.name }))],
        providers: PROVIDERS.map((p) => ({ value: p.id, label: p.label })),
      }}
      pages={POLICY_SLUGS.map(([slug, title]) => ({ slug, title, defaultTitle: defaults[slug].title, defaultBody: defaults[slug].body }))}
      site={site}
    />
  );
}
