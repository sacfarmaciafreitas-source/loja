import type { MetadataRoute } from "next";
import { getAllProducts, getCategories } from "@/lib/data";
import { POLICY_SLUGS } from "@/lib/policies";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [cats, products] = await Promise.all([getCategories().catch(() => []), getAllProducts().catch(() => [])]);
  return [
    { url: site, priority: 1 },
    { url: `${site}/ofertas`, priority: 0.8 },
    ...cats.map((c) => ({ url: `${site}/c/${c.slug}`, priority: 0.8 })),
    ...products.map((p) => ({ url: `${site}/p/${p.slug}`, priority: 0.7 })),
    ...POLICY_SLUGS.map(([k]) => ({ url: `${site}/${k}`, priority: 0.3 })),
  ];
}
