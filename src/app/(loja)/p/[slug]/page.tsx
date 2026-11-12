import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductRail } from "@/components/product-rail";
import { getCategory, getProduct, getProducts } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { BuyBox } from "./buy-box";
import { Gallery } from "./gallery";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return {};
  const desc = p.description.slice(0, 155);
  return {
    title: p.name,
    description: desc,
    alternates: { canonical: `/p/${p.slug}` },
    openGraph: { title: p.name, description: desc, images: p.image_url ? [p.image_url] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || !product.active) notFound();
  const [category, related, s] = await Promise.all([getCategory(product.category_slug), getProducts({ category: product.category_slug, limit: 13 }), getSettings()]);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";

  // Dados estruturados: o Google confere preço, estoque e vendedor por aqui
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku ?? product.id,
    ...(product.gtin ? { gtin: product.gtin } : {}),
    brand: { "@type": "Brand", name: product.brand || s.merchant.defaultBrand || s.brand.name },
    ...(product.image_url ? { image: [product.image_url, ...(product.images ?? []).filter((u) => u !== product.image_url)] } : {}),
    offers: {
      "@type": "Offer",
      url: `${site}/p/${product.slug}`,
      priceCurrency: "BRL",
      price: product.price.toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: s.company.tradeName },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "BR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: s.commerce.returnDays,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-store pt-5">
        <nav className="text-[12px] text-muted">
          <Link href="/" className="hover:text-brand">Início</Link>
          {category && <> / <Link href={`/c/${category.slug}`} className="hover:text-brand">{category.name}</Link></>}
          <span className="text-ink"> / {product.name}</span>
        </nav>
        <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-12">
          <div><Gallery name={product.name} main={product.image_url} images={product.images ?? []} /></div>
          <BuyBox product={product} />
        </div>
        <section className="mt-12 rounded-[calc(var(--radius)*1.2)] border border-line p-6 md:p-8">
          <h2 className="text-xl font-extrabold">Descrição do produto</h2>
          <p className="mt-3 whitespace-pre-line text-[14.5px] leading-relaxed text-ink/85">{product.description}</p>
        </section>
      </div>
      <ProductRail title="Quem viu, também comprou" href={category ? `/c/${category.slug}` : undefined} products={related.filter((r) => r.id !== product.id).slice(0, 12)} />
    </>
  );
}
