import Link from "next/link";
import type { Category, Product } from "@/lib/types";
import { ProductGrid } from "./product-grid";

const sorts = [
  ["relevancia", "Relevância"],
  ["menor-preco", "Menor preço"],
  ["maior-preco", "Maior preço"],
  ["desconto", "Maior desconto"],
  ["az", "A a Z"],
];

/** Página de listagem (categoria, ofertas, busca) no padrão da loja, com paginação no servidor. */
export function Listing({
  title,
  subtitle,
  crumbs = [],
  products,
  total,
  page = 1,
  perPage = 48,
  ordem = "relevancia",
  categories = [],
  activeCategory,
  params = {},
}: {
  title: React.ReactNode;
  subtitle?: string;
  crumbs?: [string, string?][];
  products: Product[];
  total: number;
  page?: number;
  perPage?: number;
  ordem?: string;
  categories?: Category[];
  activeCategory?: Category;
  params?: Record<string, string>;
}) {
  const qs = (extra: Record<string, string | number>) => `?${new URLSearchParams({ ...params, ordem, ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])) })}`;
  const pages = Math.max(1, Math.ceil(total / perPage));

  // barra lateral: filhas da categoria atual; sem filhas, as irmãs; fora de categoria, as principais
  const children = activeCategory ? categories.filter((c) => c.parent_id === activeCategory.id) : [];
  const side = children.length
    ? children
    : activeCategory
      ? categories.filter((c) => (c.parent_id ?? null) === (activeCategory.parent_id ?? null))
      : categories.filter((c) => !c.parent_id);
  const parent = activeCategory?.parent_id ? categories.find((c) => c.id === activeCategory.parent_id) : null;

  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2);

  return (
    <div className="container-store pt-5">
      <nav className="text-[12px] text-muted">
        <Link href="/" className="hover:text-brand">Início</Link>
        {crumbs.map(([l, h], i) => (
          <span key={i}> / {h ? <Link href={h} className="hover:text-brand">{l}</Link> : <span className="text-ink">{l}</span>}</span>
        ))}
      </nav>
      <div className="mt-3 grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block">
          {parent && <Link href={`/c/${parent.slug}`} className="mb-2 block text-[12.5px] font-semibold text-brand">← {parent.name}</Link>}
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-muted">{children.length ? "Subcategorias" : "Categorias"}</p>
          <ul className="space-y-0.5">
            {side.map((c) => (
              <li key={c.id}>
                <Link href={`/c/${c.slug}`} className={`block rounded-lg px-3 py-2 text-[13.5px] transition ${c.id === activeCategory?.id ? "bg-soft font-bold text-brand" : "hover:bg-soft hover:text-brand"}`}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="animate-rise">
              <h1 className="text-2xl font-extrabold tracking-tight md:text-[28px]">{title}</h1>
              <p className="mt-1 text-[13.5px] text-muted">{total} {total === 1 ? "produto" : "produtos"}{subtitle ? ` · ${subtitle}` : ""}</p>
            </div>
            <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-white p-1">
              {sorts.map(([v, l]) => (
                <Link key={v} href={`?${new URLSearchParams({ ...params, ordem: v })}`} scroll={false} className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${ordem === v ? "bg-brand text-brand-ink" : "text-muted hover:text-ink"}`}>{l}</Link>
              ))}
            </div>
          </div>

          {children.length > 0 && (
            <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto lg:hidden">
              {children.map((c) => <Link key={c.id} href={`/c/${c.slug}`} className="shrink-0 rounded-full border border-line px-3.5 py-1.5 text-[12.5px] font-semibold">{c.name}</Link>)}
            </div>
          )}

          <div className="mt-5">
            {products.length ? <ProductGrid products={products} /> : <p className="py-20 text-center text-muted">Nenhum produto encontrado.</p>}
          </div>

          {pages > 1 && (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
              {page > 1 && <Link href={qs({ pagina: page - 1 })} className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold hover:border-brand">Anterior</Link>}
              {nums.map((n, i) => (
                <span key={n} className="flex items-center gap-1.5">
                  {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
                  <Link href={qs({ pagina: n })} className={`grid h-9 min-w-9 place-items-center rounded-full px-2 text-[13px] font-semibold ${n === page ? "bg-brand text-brand-ink" : "border border-line hover:border-brand"}`}>{n}</Link>
                </span>
              ))}
              {page < pages && <Link href={qs({ pagina: page + 1 })} className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold hover:border-brand">Próxima</Link>}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
