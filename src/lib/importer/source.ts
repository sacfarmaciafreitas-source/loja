import "server-only";
import { detectBrand } from "./brands";
import { parseLiteral, type Lit } from "./literal";

/**
 * Lê o catálogo de lojas que embutem os dados no bundle JavaScript
 * (formato { cats:[{s,n,p,i}], products:[[slug,nome,imagem,preco,precoDe,[extras],descricao]] }).
 */

export type SourceCategory = { key: string; name: string; parent: string | null; count: number };
export type SourceProduct = {
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  description: string;
  images: string[];
  category: string | null;
  brand: string | null;
};
export type SourceCatalog = { origin: string; scannedAt: string; categories: SourceCategory[]; products: SourceProduct[] };

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

async function get(url: string) {
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "*/*" }, cache: "no-store" });
  if (!r.ok) throw new Error(`${url} respondeu ${r.status}`);
  return r.text();
}

const title = (s: string) => s.split("-").map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w)).join(" ").replace(/^./, (c) => c.toUpperCase());

async function findBundle(origin: string): Promise<string> {
  const html = await get(origin + "/");
  const urls = [...new Set([...html.matchAll(/["'](\/assets\/[\w.-]+\.js)["']/g)].map((m) => m[1]))];
  // prioriza nomes que costumam guardar o catálogo
  urls.sort((a, b) => Number(/store|catalog|data|products/i.test(b)) - Number(/store|catalog|data|products/i.test(a)));
  const tried = new Set<string>();
  const queue = [...urls];
  while (queue.length && tried.size < 40) {
    const u = queue.shift()!;
    if (tried.has(u)) continue;
    tried.add(u);
    const js = await get(origin + u).catch(() => "");
    if (js.includes("{cats:[")) return js;
    // segue imports estáticos do chunk
    for (const m of js.matchAll(/["'`]\.\/([\w.-]+\.js)["'`]/g)) queue.push(`/assets/${m[1]}`);
  }
  throw new Error("Não encontrei o catálogo nesta loja (formato não suportado).");
}

async function hubSlugs(origin: string): Promise<string[]> {
  try {
    const xml = await get(origin + "/sitemap.xml");
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    const withChildren = new Set(paths.filter((p) => p.split("/").length > 2 && !p.startsWith("/p/")).map((p) => p.split("/")[1]));
    const order: string[] = [];
    for (const p of paths) {
      const top = p.split("/")[1];
      if (top && withChildren.has(top) && !order.includes(top)) order.push(top);
    }
    return order;
  } catch {
    return [];
  }
}

export async function scanSource(input: string): Promise<SourceCatalog> {
  const origin = new URL(input.startsWith("http") ? input : `https://${input}`).origin;
  const [js, hubs] = await Promise.all([findBundle(origin), hubSlugs(origin)]);

  type Raw = { cats: { s: string; n: string; p: string | null; i: number[] }[]; products: Lit[][]; root?: number[]; name?: string };
  const raws: Raw[] = [];
  let pos = 0;
  while ((pos = js.indexOf("{cats:[", pos)) !== -1) {
    try {
      const { value, end } = parseLiteral(js, pos);
      const v = value as unknown as Raw;
      if (Array.isArray(v.cats) && Array.isArray(v.products)) raws.push(v);
      pos = end;
    } catch {
      pos += 7;
    }
  }
  if (!raws.length) throw new Error("Catálogo encontrado, mas não consegui ler os produtos.");

  const abs = (p: string) => (/^https?:/.test(p) ? p : p.startsWith("/") ? origin + p : `${origin}/catalogo/${p}.webp`);
  const categories = new Map<string, SourceCategory>();
  const products = new Map<string, SourceProduct>();

  raws.forEach((raw, h) => {
    const hubSlug = hubs[h] || (raw.name ? raw.name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-") : `secao-${h + 1}`);
    const hubName = raw.name || title(hubSlug);
    if (!categories.has(hubSlug)) categories.set(hubSlug, { key: hubSlug, name: hubName, parent: null, count: 0 });

    // chave única por categoria (prefixa com a seção se o nome repetir entre seções)
    const keyOf = new Map<string, string>();
    for (const c of raw.cats) {
      const k = categories.has(c.s) ? `${hubSlug}-${c.s}` : c.s;
      keyOf.set(c.s, k);
    }
    for (const c of raw.cats) {
      const key = keyOf.get(c.s)!;
      categories.set(key, { key, name: c.n, parent: c.p ? keyOf.get(c.p) ?? hubSlug : hubSlug, count: 0 });
    }

    // categoria mais específica de cada produto
    const best = new Map<number, { key: string; depth: number }>();
    for (const c of raw.cats) {
      const key = keyOf.get(c.s)!;
      const depth = c.p ? 2 : 1;
      for (const idx of c.i ?? []) {
        const cur = best.get(idx);
        if (!cur || depth > cur.depth) best.set(idx, { key, depth });
      }
    }

    raw.products.forEach((t, idx) => {
      const [slug, name, img, price, old, extras, desc] = t as [string, string, string, number, number, string[], string];
      if (!slug || !name || typeof price !== "number") return;
      const s = String(slug).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || `p-${h}-${idx}`;
      const finalSlug = /^\d+$/.test(s) ? `${String(name).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}` : s;
      if (products.has(finalSlug)) return;
      const cat = best.get(idx)?.key ?? hubSlug;
      categories.get(cat)!.count++;
      products.set(finalSlug, {
        slug: finalSlug,
        name: String(name).trim(),
        price: Number(price),
        oldPrice: typeof old === "number" && old > price ? old : null,
        description: String(desc ?? "").trim(),
        images: [img, ...(Array.isArray(extras) ? extras : [])].filter(Boolean).map((x) => abs(String(x))),
        category: cat,
        brand: detectBrand(String(name)),
      });
    });
  });

  // soma as contagens nas categorias pai
  const all = [...categories.values()];
  const direct = new Map(all.map((c) => [c.key, c.count]));
  for (const c of all) {
    let p = c.parent;
    const own = direct.get(c.key) ?? 0;
    let guard = 0;
    while (p && guard++ < 10) {
      const parent = categories.get(p);
      if (!parent || parent.key === c.key) break;
      parent.count += own;
      p = parent.parent;
    }
  }

  return { origin, scannedAt: new Date().toISOString(), categories: all, products: [...products.values()] };
}
