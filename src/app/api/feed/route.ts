import { getAllProducts, getCategories } from "@/lib/data";
import { shippingFor } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Feed de produtos do Google Merchant Center. URL: /feed.xml (opções em /admin/configuracoes/merchant) */
export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const [s, products, cats] = await Promise.all([getSettings(), getAllProducts().catch(() => []), getCategories().catch(() => [])]);
  const m = s.merchant;
  const catName = (slug: string) => {
    // caminho completo: Beleza > Cuidados com a Pele > Protetor Solar
    const path: string[] = [];
    let c = cats.find((x) => x.slug === slug);
    for (let i = 0; c && i < 6; i++) {
      path.unshift(c.name);
      const pid = c.parent_id;
      c = pid ? cats.find((x) => x.id === pid) : undefined;
    }
    return path.join(" > ");
  };
  const link = (slug: string) => `${site}/p/${slug}${m.utm ? (m.utm.startsWith("?") ? m.utm : `?${m.utm}`) : ""}`;

  const items = products
    .filter((p) => m.includeOutOfStock || p.stock > 0)
    .map((p) => {
      const onSale = p.compare_at_price && p.compare_at_price > p.price;
      const brand = p.brand || m.defaultBrand;
      return `
    <item>
      <g:id>${esc(p.sku || p.id)}</g:id>
      <g:title>${esc(p.name.slice(0, 150))}</g:title>
      <g:description>${esc((p.description || p.name).slice(0, 5000))}</g:description>
      <g:link>${esc(link(p.slug))}</g:link>
      ${p.image_url ? `<g:image_link>${esc(p.image_url)}</g:image_link>` : ""}
      ${(p.images ?? []).filter((u) => u !== p.image_url).slice(0, 10).map((u) => `<g:additional_image_link>${esc(u)}</g:additional_image_link>`).join("")}
      <g:availability>${p.stock > 0 ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${(onSale ? p.compare_at_price! : p.price).toFixed(2)} BRL</g:price>
      ${onSale ? `<g:sale_price>${p.price.toFixed(2)} BRL</g:sale_price>` : ""}
      <g:condition>${m.condition}</g:condition>
      ${brand ? `<g:brand>${esc(brand)}</g:brand>` : ""}
      ${p.gtin ? `<g:gtin>${esc(p.gtin)}</g:gtin>` : "<g:identifier_exists>no</g:identifier_exists>"}
      ${p.sku ? `<g:mpn>${esc(p.sku)}</g:mpn>` : ""}
      ${m.googleCategory ? `<g:google_product_category>${esc(m.googleCategory)}</g:google_product_category>` : ""}
      <g:product_type>${esc(catName(p.category_slug))}</g:product_type>
      ${m.includeShipping ? `<g:shipping><g:country>BR</g:country><g:price>${shippingFor(p.price, s.commerce).toFixed(2)} BRL</g:price></g:shipping>` : ""}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(s.brand.name)}</title>
    <link>${site}</link>
    <description>${esc(s.seo.description)}</description>${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
