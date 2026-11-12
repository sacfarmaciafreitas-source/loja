import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/listing";
import { getCategories, getProductsPage } from "@/lib/data";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ ordem?: string; pagina?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getCategories()).find((x) => x.slug === slug);
  return c ? { title: c.name, description: c.blurb ?? undefined, alternates: { canonical: `/c/${c.slug}` } } : {};
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { ordem = "relevancia", pagina } = await searchParams;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const page = Math.max(1, Number(pagina) || 1);
  const { items, total } = await getProductsPage({ category: slug, sort: ordem, page });

  const trail: [string, string?][] = [];
  let p = category.parent_id ? categories.find((c) => c.id === category.parent_id) : undefined;
  for (let i = 0; p && i < 5; i++) {
    trail.unshift([p.name, `/c/${p.slug}`]);
    const pid = p.parent_id;
    p = pid ? categories.find((c) => c.id === pid) : undefined;
  }

  return (
    <Listing
      title={category.name}
      subtitle={category.blurb ?? undefined}
      crumbs={[...trail, [category.name]]}
      products={items}
      total={total}
      page={page}
      ordem={ordem}
      categories={categories}
      activeCategory={category}
    />
  );
}
