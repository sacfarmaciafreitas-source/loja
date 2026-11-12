import Link from "next/link";
import { ProductForm } from "../product-form";

export default async function NewProduct({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <>
      <Link href="/admin/produtos" className="text-sm font-semibold text-muted hover:text-brand">← Produtos</Link>
      <h1 className="mb-6 mt-3 font-display text-3xl font-semibold">Novo produto</h1>
      <ProductForm error={erro} />
    </>
  );
}
