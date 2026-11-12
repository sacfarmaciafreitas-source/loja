import type { Metadata } from "next";
import { Listing } from "@/components/listing";
import { getCategories, getProductsPage } from "@/lib/data";

export const metadata: Metadata = { title: "Busca", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; ordem?: string; pagina?: string }> }) {
  const { q = "", ordem = "relevancia", pagina } = await searchParams;
  const page = Math.max(1, Number(pagina) || 1);
  const [{ items, total }, categories] = await Promise.all([getProductsPage({ q: q.trim() || undefined, sort: ordem, page }), getCategories()]);
  return (
    <Listing
      title={q ? <>Resultados para <span className="text-brand">“{q}”</span></> : "Todos os produtos"}
      crumbs={[["Busca"]]}
      products={items}
      total={total}
      page={page}
      ordem={ordem}
      categories={categories}
      params={q ? { q } : {}}
    />
  );
}
