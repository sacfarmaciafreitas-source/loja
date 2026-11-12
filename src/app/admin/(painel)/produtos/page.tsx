import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { requireAdmin } from "@/lib/admin";
import { money } from "@/lib/format";
import { DemoOnly } from "../demo-only";
import { PriceAdjust } from "./price-adjust";

const PER = 50;

type Row = { id: string; slug: string; name: string; brand: string | null; price: number; compare_at_price: number | null; stock: number; active: boolean; featured: boolean; image_url: string | null; category: { name: string } | null };

export default async function Products({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; pagina?: string }> }) {
  const { q = "", cat = "", pagina } = await searchParams;
  const page = Math.max(1, Number(pagina) || 1);
  const { db, demo } = await requireAdmin();
  if (demo) return <DemoOnly />;

  const { data: catsRaw } = await db.from("categories").select("id,name,parent_id,position").order("position").order("name");
  const cats = (catsRaw ?? []) as { id: string; name: string; parent_id: string | null }[];
  // árvore em ordem, com profundidade, para os selects
  const tree: { id: string; name: string; depth: number }[] = [];
  const walk = (parent: string | null, depth: number) => cats.filter((c) => (c.parent_id ?? null) === parent).forEach((c) => { tree.push({ id: c.id, name: c.name, depth }); walk(c.id, depth + 1); });
  walk(null, 0);
  const ids = (() => {
    if (!cat) return null;
    const out = [cat];
    for (let i = 0; i < out.length; i++) cats.filter((c) => c.parent_id === out[i]).forEach((c) => out.push(c.id));
    return out;
  })();

  let query = db.from("products").select("id,slug,name,brand,price,compare_at_price,stock,active,featured,image_url,category:categories(name)", { count: "exact" }).order("name").range((page - 1) * PER, page * PER - 1);
  if (q) query = query.or(`name.ilike.%${q.replace(/[%,()]/g, "")}%,sku.ilike.%${q.replace(/[%,()]/g, "")}%`);
  if (ids) query = query.in("category_id", ids);
  const { data, count } = await query;
  const products = (data ?? []) as unknown as Row[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PER));
  const link = (p: number) => `?${new URLSearchParams({ ...(q ? { q } : {}), ...(cat ? { cat } : {}), pagina: String(p) })}`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Produtos</h1>
          <p className="text-sm text-muted">{total} produtos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/produtos/importar-loja" className="btn btn-ghost">Importar de outra loja</Link>
          <Link href="/admin/produtos/importar" className="btn btn-ghost">Importar CSV</Link>
          <Link href="/admin/produtos/novo" className="btn btn-primary">+ Novo produto</Link>
        </div>
      </div>

      <div className="mt-4"><PriceAdjust categories={tree} /></div>

      <form className="mt-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Buscar por nome ou SKU" className="input max-w-sm" />
        <select name="cat" defaultValue={cat} className="input max-w-xs">
          <option value="">Todas as categorias</option>
          {tree.map((c) => <option key={c.id} value={c.id}>{"  ".repeat(c.depth)}{c.name}</option>)}
        </select>
        <button className="btn btn-primary">Filtrar</button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
            <tr><th className="px-5 py-3">Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th className="px-5">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-50">
                <td className="px-5 py-2.5">
                  <Link href={`/admin/produtos/${p.id}`} className="flex items-center gap-3">
                    <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-white"><ProductImage src={p.image_url} name={p.name} /></span>
                    <span><span className="line-clamp-1 block font-semibold hover:text-brand">{p.name}</span><span className="text-xs text-muted">{p.brand}</span></span>
                  </Link>
                </td>
                <td className="text-muted">{p.category?.name ?? "—"}</td>
                <td className="whitespace-nowrap font-semibold">
                  {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && <span className="mr-1 text-xs font-normal text-muted line-through">{money(Number(p.compare_at_price))}</span>}
                  {money(Number(p.price))}
                </td>
                <td className={p.stock <= 0 ? "font-bold text-accent" : ""}>{p.stock}</td>
                <td className="px-5">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${p.active ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"}`}>{p.active ? "Ativo" : "Oculto"}</span>
                  {p.featured && <span className="ml-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">Destaque</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length && <p className="px-5 py-12 text-center text-sm text-muted">Nenhum produto encontrado.</p>}
      </div>

      {pages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link href={link(page - 1)} className="btn btn-ghost !py-2">Anterior</Link>}
          <span className="text-muted">Página {page} de {pages}</span>
          {page < pages && <Link href={link(page + 1)} className="btn btn-ghost !py-2">Próxima</Link>}
        </div>
      )}
    </>
  );
}
