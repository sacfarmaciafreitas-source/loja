import { DemoOnly } from "../demo-only";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/format";
import { ProductImage } from "@/components/product-image";

type P = {
  id?: string; name?: string; slug?: string; description?: string; brand?: string | null; gtin?: string | null; sku?: string | null;
  price?: number; compare_at_price?: number | null; stock?: number; image_url?: string | null; category_id?: string | null; active?: boolean; featured?: boolean;
};

const num = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").replace(/\./g, "").replace(",", ".").trim();
  return s ? Number(s) : null;
};

async function save(formData: FormData) {
  "use server";
  const { db } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name")).trim();
  let image_url = String(formData.get("image_url") || "") || null;

  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${slugify(name)}-${Date.now()}.${ext}`;
    const { error } = await db.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: true });
    if (error) throw error;
    image_url = db.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  const row = {
    name,
    slug: String(formData.get("slug") || "").trim() || slugify(name),
    description: String(formData.get("description") || ""),
    brand: String(formData.get("brand") || "") || null,
    gtin: String(formData.get("gtin") || "") || null,
    sku: String(formData.get("sku") || "") || null,
    price: num(formData.get("price")) ?? 0,
    compare_at_price: num(formData.get("compare_at_price")),
    stock: Math.floor(num(formData.get("stock")) ?? 0),
    category_id: String(formData.get("category_id") || "") || null,
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
    image_url,
  };

  const { error } = id ? await db.from("products").update(row).eq("id", id) : await db.from("products").insert(row);
  if (error) redirect(`/admin/produtos/${id || "novo"}?erro=${encodeURIComponent(error.message)}`);
  revalidatePath("/", "layout");
  redirect("/admin/produtos");
}

async function remove(formData: FormData) {
  "use server";
  const { db } = await requireAdmin();
  await db.from("products").delete().eq("id", String(formData.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/produtos");
}

export async function ProductForm({ product = {}, error }: { product?: P; error?: string }) {
  const { db, demo } = await requireAdmin();
  if (demo) return <DemoOnly />;
  const { data: cats } = await db.from("categories").select("id,name").order("position");
  const L = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
    <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>{children}</label>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form action={save} id="pform" className="space-y-5 rounded-3xl bg-white p-6 ring-1 ring-line">
        <input type="hidden" name="id" value={product.id ?? ""} />
        <input type="hidden" name="image_url" value={product.image_url ?? ""} />
        <L label="Nome do produto"><input name="name" required defaultValue={product.name} className="input" /></L>
        <div className="grid gap-4 sm:grid-cols-2">
          <L label="Marca"><input name="brand" defaultValue={product.brand ?? ""} className="input" /></L>
          <L label="Categoria">
            <select name="category_id" defaultValue={product.category_id ?? ""} className="input">
              <option value="">Sem categoria</option>
              {cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </L>
          <L label="Preço (R$)"><input name="price" required inputMode="decimal" defaultValue={product.price?.toString().replace(".", ",")} className="input" /></L>
          <L label="Preço “de” (opcional)"><input name="compare_at_price" inputMode="decimal" defaultValue={product.compare_at_price?.toString().replace(".", ",") ?? ""} className="input" /></L>
          <L label="Estoque"><input name="stock" inputMode="numeric" defaultValue={product.stock ?? 0} className="input" /></L>
          <L label="SKU"><input name="sku" defaultValue={product.sku ?? ""} className="input" /></L>
          <L label="GTIN / EAN (código de barras)"><input name="gtin" defaultValue={product.gtin ?? ""} className="input" /></L>
          <L label="URL (slug)"><input name="slug" defaultValue={product.slug} placeholder="gerado automaticamente" className="input" /></L>
        </div>
        <L label="Descrição"><textarea name="description" rows={7} defaultValue={product.description} className="input" /></L>
        <L label="Foto do produto"><input name="image" type="file" accept="image/*" className="input" /></L>
        <div className="flex gap-6 text-sm font-semibold">
          <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={product.active ?? true} className="h-4 w-4 accent-[var(--brand)]" /> Ativo na loja</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={product.featured ?? false} className="h-4 w-4 accent-[var(--brand)]" /> Destaque na home</label>
        </div>
        {error && <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">{error}</p>}
        <button className="btn btn-primary">Salvar produto</button>
      </form>

      <aside className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-3xl bg-white ring-1 ring-line"><ProductImage src={product.image_url ?? null} name={product.name || "Novo produto"} /></div>
        <p className="text-xs leading-relaxed text-muted">Para o Google Merchant: preencha marca, GTIN quando houver, e use foto em fundo branco sem textos ou selos.</p>
        {product.id && (
          <form action={remove}>
            <input type="hidden" name="id" value={product.id} />
            <button className="w-full rounded-full border border-accent/40 py-2.5 text-sm font-bold text-accent hover:bg-accent/5">Excluir produto</button>
          </form>
        )}
      </aside>
    </div>
  );
}
