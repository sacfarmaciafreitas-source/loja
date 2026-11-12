import { DemoOnly } from "../../demo-only";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { ProductForm } from "../product-form";

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> }) {
  const { id } = await params;
  const { erro } = await searchParams;
  const { db, demo } = await requireAdmin();
  if (demo) return <DemoOnly />;
  const { data } = await db.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <Link href="/admin/produtos" className="text-sm font-semibold text-muted hover:text-brand">← Produtos</Link>
      <h1 className="mb-6 mt-3 text-2xl font-extrabold">Editar produto</h1>
      <ProductForm product={{ ...data, price: Number(data.price), compare_at_price: data.compare_at_price == null ? null : Number(data.compare_at_price) }} error={erro} />
    </>
  );
}
