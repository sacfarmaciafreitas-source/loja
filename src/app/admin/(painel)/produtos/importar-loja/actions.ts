"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { scanSource, type SourceCatalog } from "@/lib/importer/source";

const BUCKET = "product-images";
const CATALOG_PATH = "imports/catalogo.json";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const g = globalThis as unknown as { __catalog?: SourceCatalog };

export type ScanResult = {
  ok: boolean;
  error?: string;
  origin?: string;
  total?: number;
  withImages?: number;
  categories?: { key: string; name: string; parent: string | null; count: number }[];
};

/** 1. Lê o catálogo da loja de origem e guarda uma cópia no Storage para os próximos passos. */
export async function scanStore(url: string): Promise<ScanResult> {
  const { db } = await requireAdmin();
  try {
    const cat = await scanSource(url);
    const body = new Blob([JSON.stringify(cat)], { type: "application/json" });
    const { error } = await db.storage.from(BUCKET).upload(CATALOG_PATH, body, { upsert: true, contentType: "application/json" });
    if (error) return { ok: false, error: `Não consegui salvar o catálogo no Storage: ${error.message}` };
    g.__catalog = cat;
    return {
      ok: true,
      origin: cat.origin,
      total: cat.products.length,
      withImages: cat.products.filter((p) => p.images.length).length,
      categories: cat.categories,
    };
  } catch (e) {
    return { ok: false, error: errMsg(e, "Falha ao ler a loja") };
  }
}

async function loadCatalog(db: Awaited<ReturnType<typeof requireAdmin>>["db"]): Promise<SourceCatalog> {
  if (g.__catalog) return g.__catalog;
  const { data, error } = await db.storage.from(BUCKET).download(CATALOG_PATH);
  if (error || !data) throw new Error("Catálogo não encontrado. Clique em Analisar de novo.");
  g.__catalog = JSON.parse(await data.text()) as SourceCatalog;
  return g.__catalog;
}

/** 2. Cria as categorias escolhidas (e as categorias pai), mantendo a hierarquia. */
export async function importCategories(keys: string[]): Promise<{ ok: boolean; created?: number; error?: string }> {
  const { db } = await requireAdmin();
  try {
    const cat = await loadCatalog(db);
    const byKey = new Map(cat.categories.map((c) => [c.key, c]));
    const wanted = new Set<string>();
    for (const k of keys) {
      let cur = byKey.get(k);
      for (let i = 0; cur && i < 8; i++) {
        wanted.add(cur.key);
        cur = cur.parent ? byKey.get(cur.parent) : undefined;
      }
    }
    const depth = (k: string) => {
      let d = 0;
      let cur = byKey.get(k);
      while (cur?.parent && d < 8) {
        d++;
        cur = byKey.get(cur.parent);
      }
      return d;
    };
    const levels = new Map<number, string[]>();
    for (const k of wanted) levels.set(depth(k), [...(levels.get(depth(k)) ?? []), k]);

    // Lê todas as categorias existentes de uma vez (em páginas), em vez de filtrar por
    // centenas de slugs na URL, que estoura o limite de tamanho do endereço.
    const existing = new Map<string, { id: string; position: number }>();
    for (let from = 0; ; from += 1000) {
      const { data, error } = await db.from("categories").select("id,slug,position").range(from, from + 999);
      if (error) throw error;
      (data ?? []).forEach((r) => existing.set(r.slug, { id: r.id, position: r.position ?? 0 }));
      if (!data || data.length < 1000) break;
    }
    let position = [...existing.values()].reduce((m, c) => Math.max(m, c.position + 1), 0);

    for (const d of [...levels.keys()].sort((a, b) => a - b)) {
      // todas as linhas com as mesmas colunas: o upsert em lote exige isso
      const rows = levels.get(d)!.map((k) => {
        const c = byKey.get(k)!;
        return {
          slug: k,
          name: c.name,
          parent_id: c.parent ? existing.get(c.parent)?.id ?? null : null,
          position: existing.get(k)?.position ?? position++,
        };
      });
      for (let i = 0; i < rows.length; i += 100) {
        const { data, error } = await db.from("categories").upsert(rows.slice(i, i + 100), { onConflict: "slug" }).select("id,slug,position");
        if (error) throw error;
        (data ?? []).forEach((r) => existing.set(r.slug, { id: r.id, position: r.position ?? 0 }));
      }
    }
    return { ok: true, created: wanted.size };
  } catch (e) {
    return { ok: false, error: errMsg(e, "Erro ao criar categorias") };
  }
}

/** Erros do Supabase não são instâncias de Error: extrai a mensagem real. */
function errMsg(e: unknown, fallback: string) {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object") {
    const o = e as { message?: string; details?: string; hint?: string; code?: string };
    const parts = [o.message, o.details, o.hint].filter(Boolean).join(" | ");
    if (parts) return o.code ? `${parts} (código ${o.code})` : parts;
  }
  return fallback;
}

export type BatchOptions = {
  keys: string[];
  imagesPerProduct: number; // 0 = todas
  stock: number;
  pricePct: number;
  round90: boolean;
  hidden: boolean;
  skipExistingImages: boolean;
};

const extOf = (type: string, url: string) => {
  const m = /image\/(webp|png|jpe?g|gif|avif)/.exec(type);
  if (m) return m[1].replace("jpeg", "jpg");
  return (/\.(webp|png|jpe?g|gif|avif)(\?|$)/i.exec(url)?.[1] ?? "jpg").toLowerCase().replace("jpeg", "jpg");
};

/** 3. Importa um lote: baixa as fotos para o nosso Storage e grava os produtos. */
export async function importBatch(offset: number, size: number, o: BatchOptions): Promise<{ ok: boolean; processed: number; total: number; images: number; failedImages: number; errors: string[] }> {
  const { db } = await requireAdmin();
  const errors: string[] = [];
  let images = 0;
  let failedImages = 0;
  try {
    const cat = await loadCatalog(db);
    const keys = new Set(o.keys);
    const list = cat.products.filter((p) => p.category && keys.has(p.category));
    const slice = list.slice(offset, offset + size);
    if (!slice.length) return { ok: true, processed: 0, total: list.length, images, failedImages, errors };

    const { data: cats } = await db.from("categories").select("id,slug").in("slug", [...new Set(slice.map((p) => p.category!))]);
    const catId = new Map((cats ?? []).map((c) => [c.slug, c.id]));
    const { data: existing } = await db.from("products").select("slug,image_url,images").in("slug", slice.map((p) => p.slug));
    const prev = new Map((existing ?? []).map((r) => [r.slug, r]));
    const ourHost = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/^https?:\/\//, "");

    const upload = async (url: string, path: string) => {
      const r = await fetch(url, { headers: { "User-Agent": UA, Referer: cat.origin + "/" } });
      if (!r.ok) throw new Error(`${r.status}`);
      const type = r.headers.get("content-type") || "image/jpeg";
      const buf = new Uint8Array(await r.arrayBuffer());
      const full = `${path}.${extOf(type, url)}`;
      const { error } = await db.storage.from(BUCKET).upload(full, buf, { contentType: type, upsert: true, cacheControl: "31536000" });
      if (error) throw new Error(error.message);
      images++;
      return db.storage.from(BUCKET).getPublicUrl(full).data.publicUrl;
    };

    const rows: Record<string, unknown>[] = [];
    // 4 produtos em paralelo para não sobrecarregar a origem
    for (let i = 0; i < slice.length; i += 4) {
      const part = slice.slice(i, i + 4);
      const done = await Promise.all(
        part.map(async (p) => {
          const old = prev.get(p.slug);
          let gallery: string[] = [];
          const already = o.skipExistingImages && old?.image_url && ourHost && String(old.image_url).includes(ourHost);
          if (already) {
            gallery = [old!.image_url as string, ...((old!.images as string[]) ?? []).filter((u) => u !== old!.image_url)];
          } else {
            const src = o.imagesPerProduct > 0 ? p.images.slice(0, o.imagesPerProduct) : p.images;
            for (let k = 0; k < src.length; k++) {
              try {
                gallery.push(await upload(src[k], `produtos/${p.slug}-${k + 1}`));
              } catch {
                failedImages++;
              }
            }
          }
          const factor = 1 + (o.pricePct || 0) / 100;
          const adj = (v: number) => {
            const x = v * factor;
            return o.round90 ? Math.max(0.9, Math.floor(x) + 0.9) : Math.round(x * 100) / 100;
          };
          const price = adj(p.price);
          const compare = p.oldPrice ? Math.round(p.oldPrice * factor * 100) / 100 : null;
          return {
            slug: p.slug,
            name: p.name,
            description: p.description,
            brand: p.brand,
            price,
            compare_at_price: compare && compare > price ? compare : null,
            stock: o.stock,
            image_url: gallery[0] ?? null,
            images: gallery,
            category_id: catId.get(p.category!) ?? null,
            active: !o.hidden,
            source_url: `${cat.origin}/p/${p.slug}`,
          };
        }),
      );
      rows.push(...done);
    }

    const { error } = await db.from("products").upsert(rows, { onConflict: "slug" });
    if (error) errors.push(errMsg(error, "Erro ao gravar produtos"));
    if (offset + size >= list.length) revalidatePath("/", "layout");
    return { ok: !error, processed: slice.length, total: list.length, images, failedImages, errors };
  } catch (e) {
    return { ok: false, processed: 0, total: 0, images, failedImages, errors: [errMsg(e, "Erro no lote")] };
  }
}
