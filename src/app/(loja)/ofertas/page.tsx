import type { Metadata } from "next";
import { Listing } from "@/components/listing";
import { getCategories, getProductsPage } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Ofertas" };

export default async function Offers({ searchParams }: { searchParams: Promise<{ ordem?: string; tipo?: string; pagina?: string }> }) {
  const { ordem, tipo, pagina } = await searchParams;
  const destaques = tipo === "destaques";
  const sort = ordem ?? (destaques ? "relevancia" : "desconto");
  const page = Math.max(1, Number(pagina) || 1);
  const [{ items, total }, categories] = await Promise.all([
    getProductsPage({ ...(destaques ? { featured: true } : { sale: true }), sort, page }),
    getCategories(),
  ]);
  return (
    <Listing
      title={destaques ? "Mais buscados" : "Ofertas"}
      crumbs={[[destaques ? "Mais buscados" : "Ofertas"]]}
      products={items}
      total={total}
      page={page}
      ordem={sort}
      categories={categories}
      params={destaques ? { tipo: "destaques" } : {}}
    />
  );
}
