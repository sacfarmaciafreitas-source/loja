import { demoCategories, demoProducts } from "./demo-data";
import { db, isDemo } from "./supabase";
import type { Category, Product } from "./types";

const FIELDS = "id,slug,name,description,brand,gtin,sku,price,compare_at_price,stock,image_url,images,active,featured,category_id,category:categories(slug)";
const FIELDS_OLD = "id,slug,name,description,brand,gtin,sku,price,compare_at_price,stock,image_url,active,featured,category_id,category:categories(slug)";

type Row = Omit<Product, "category_slug"> & { category: { slug: string } | null };

const normalize = (r: Row): Product => ({
  ...r,
  price: Number(r.price),
  compare_at_price: r.compare_at_price == null ? null : Number(r.compare_at_price),
  images: Array.isArray((r as { images?: unknown }).images) ? ((r as { images: string[] }).images) : [],
  category_slug: r.category?.slug ?? "",
});

/** Lê produtos; se o banco ainda não tem a coluna images, repete sem ela. */
async function selectProducts(build: (fields: string) => PromiseLike<{ data: unknown; error: { message: string } | null }>) {
  let r = await build(FIELDS);
  if (r.error && /images/.test(r.error.message)) r = await build(FIELDS_OLD);
  if (r.error) throw r.error;
  return r.data;
}

const clean = (s: string) => s.replace(/[%,()*]/g, "").trim();

export async function getCategories(): Promise<Category[]> {
  if (isDemo) return demoCategories;
  for (const fields of ["id,slug,name,blurb,position,image_url,parent_id", "id,slug,name,blurb,position"]) {
    // tenta sem as colunas novas se o schema.sql ainda não foi atualizado
    const { data, error } = await db().from("categories").select(fields).order("position").order("name");
    if (!error) return (data ?? []) as unknown as Category[];
  }
  throw new Error("Não foi possível ler as categorias");
}

/** Ids da categoria e de todas as subcategorias. */
export function descendantIds(cats: Category[], slug: string) {
  const root = cats.find((c) => c.slug === slug);
  if (!root) return [];
  const ids = [root.id];
  for (let i = 0; i < ids.length; i++) cats.filter((c) => c.parent_id === ids[i]).forEach((c) => ids.push(c.id));
  return ids;
}

export async function getCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

export type ProductQuery = {
  category?: string;
  featured?: boolean;
  sale?: boolean;
  q?: string;
  limit?: number;
  ids?: string[];
  includeOutOfStock?: boolean;
};

export async function getProducts(o: ProductQuery = {}): Promise<Product[]> {
  if (isDemo) {
    let list = demoProducts.filter((p) => p.active);
    if (o.ids) list = list.filter((p) => o.ids!.includes(p.id));
    if (o.category) list = list.filter((p) => p.category_slug === o.category);
    if (o.featured) list = list.filter((p) => p.featured);
    if (o.sale) list = list.filter((p) => p.compare_at_price && p.compare_at_price > p.price);
    if (o.q) {
      const q = o.q.toLowerCase();
      list = list.filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(q));
    }
    return o.limit ? list.slice(0, o.limit) : list;
  }

  const catIds = o.category ? descendantIds(await getCategories(), o.category) : null;
  if (catIds && !catIds.length) return [];
  const data = await selectProducts((fields) => {
    let query = db().from("products").select(fields).eq("active", true).order("featured", { ascending: false }).order("name");
    if (o.ids) query = query.in("id", o.ids);
    if (catIds) query = query.in("category_id", catIds);
    if (o.featured) query = query.eq("featured", true);
    if (o.sale) query = query.not("compare_at_price", "is", null);
    if (o.q && clean(o.q)) query = query.or(`name.ilike.%${clean(o.q)}%,brand.ilike.%${clean(o.q)}%`);
    query = query.limit(o.limit ? (o.sale ? o.limit * 3 : o.limit) : 2000);
    return query;
  });
  let list = ((data ?? []) as unknown as Row[]).map(normalize);
  if (o.sale) list = list.filter((p) => p.compare_at_price && p.compare_at_price > p.price).slice(0, o.limit);
  return list;
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (isDemo) return demoProducts.find((p) => p.slug === slug) ?? null;
  const data = await selectProducts((fields) => db().from("products").select(fields).eq("slug", slug).maybeSingle());
  return data ? normalize(data as unknown as Row) : null;
}

/** Inclui inativos: usado para validar o carrinho no servidor. */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  if (isDemo) return demoProducts.filter((p) => ids.includes(p.id));
  const data = await selectProducts((fields) => db().from("products").select(fields).in("id", ids));
  return ((data ?? []) as unknown as Row[]).map(normalize);
}

export type Sort = "relevancia" | "menor-preco" | "maior-preco" | "desconto" | "az";

/** Listagem paginada no banco (categorias, busca, ofertas). */
export async function getProductsPage(o: ProductQuery & { sort?: string; page?: number; perPage?: number }): Promise<{ items: Product[]; total: number }> {
  const perPage = o.perPage ?? 48;
  const page = Math.max(1, o.page ?? 1);
  if (isDemo) {
    let list = await getProducts({ ...o, limit: undefined });
    list = sortList(list, o.sort);
    return { items: list.slice((page - 1) * perPage, page * perPage), total: list.length };
  }
  const catIds = o.category ? descendantIds(await getCategories(), o.category) : null;
  if (catIds && !catIds.length) return { items: [], total: 0 };
  const build = (fields: string) => {
    let q = db().from("products").select(fields, { count: "exact" }).eq("active", true);
    if (catIds) q = q.in("category_id", catIds);
    if (o.featured) q = q.eq("featured", true);
    if (o.sale) q = q.not("compare_at_price", "is", null);
    if (o.q && clean(o.q)) q = q.or(`name.ilike.%${clean(o.q)}%,brand.ilike.%${clean(o.q)}%`);
    if (o.sort === "menor-preco") q = q.order("price", { ascending: true });
    else if (o.sort === "maior-preco") q = q.order("price", { ascending: false });
    else if (o.sort === "az") q = q.order("name");
    else q = q.order("featured", { ascending: false }).order("name");
    return q.range((page - 1) * perPage, page * perPage - 1);
  };
  let r = await build(FIELDS);
  if (r.error && /images/.test(r.error.message)) r = await build(FIELDS_OLD);
  if (r.error) throw r.error;
  let items = ((r.data ?? []) as unknown as Row[]).map(normalize);
  if (o.sale) items = items.filter((p) => p.compare_at_price && p.compare_at_price > p.price);
  if (o.sort === "desconto") items = sortList(items, "desconto");
  return { items, total: r.count ?? items.length };
}

/** Todos os produtos ativos (feed e sitemap), em páginas de 1000. */
export async function getAllProducts(): Promise<Product[]> {
  if (isDemo) return getProducts();
  const out: Product[] = [];
  for (let from = 0; from < 100000; from += 1000) {
    const data = await selectProducts((fields) => db().from("products").select(fields).eq("active", true).order("id").range(from, from + 999));
    const rows = ((data ?? []) as unknown as Row[]).map(normalize);
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

export function sortList(list: Product[], ordem?: string) {
  const l = [...list];
  if (ordem === "menor-preco") l.sort((a, b) => a.price - b.price);
  if (ordem === "maior-preco") l.sort((a, b) => b.price - a.price);
  if (ordem === "az") l.sort((a, b) => a.name.localeCompare(b.name));
  if (ordem === "desconto") {
    const d = (p: Product) => (p.compare_at_price ? 1 - p.price / p.compare_at_price : 0);
    l.sort((a, b) => d(b) - d(a));
  }
  return l;
}
