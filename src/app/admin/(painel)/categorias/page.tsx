import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/format";
import { DemoOnly } from "../demo-only";
import { CategoryRow } from "./category-row";

async function create(formData: FormData) {
  "use server";
  const { db } = await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const { count } = await db.from("categories").select("id", { count: "exact", head: true });
  const { error } = await db.from("categories").insert({ name, slug: slugify(String(formData.get("slug") || "") || name), blurb: String(formData.get("blurb") || "") || null, position: count ?? 0 });
  revalidatePath("/", "layout");
  redirect(`/admin/categorias${error ? `?erro=${encodeURIComponent(error.message)}` : "?ok=1"}`);
}

export default async function Categories({ searchParams }: { searchParams: Promise<{ erro?: string; ok?: string }> }) {
  const { erro, ok } = await searchParams;
  const { db, demo } = await requireAdmin();
  if (demo) return <DemoOnly />;
  const [{ data: cats }, { data: counts }] = await Promise.all([
    db.from("categories").select("id,slug,name,blurb,position,image_url").order("position").order("name"),
    db.from("products").select("category_id"),
  ]);
  const count = (id: string) => (counts ?? []).filter((p) => p.category_id === id).length;

  return (
    <>
      <h1 className="text-2xl font-extrabold">Categorias</h1>
      <p className="mt-1 text-sm text-muted">Aparecem no menu “Todas as categorias”, nas páginas /c/nome e podem virar vitrines na home.</p>

      <form action={create} className="mt-6 grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-[1fr_1fr_1.4fr_auto]">
        <input name="name" required placeholder="Nome da categoria" className="input" />
        <input name="slug" placeholder="URL (automática)" className="input" />
        <input name="blurb" placeholder="Descrição curta (opcional)" className="input" />
        <button className="btn btn-primary">+ Criar</button>
      </form>
      {erro && <p className="mt-3 rounded-xl bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent">{erro}</p>}
      {ok && <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">Categoria salva.</p>}

      <ul className="mt-6 space-y-2">
        {(cats ?? []).map((c, i) => (
          <CategoryRow key={c.id} cat={c} count={count(c.id)} first={i === 0} last={i === (cats?.length ?? 0) - 1} />
        ))}
        {!cats?.length && <li className="rounded-2xl border border-dashed border-line py-10 text-center text-sm text-muted">Nenhuma categoria ainda.</li>}
      </ul>
    </>
  );
}
