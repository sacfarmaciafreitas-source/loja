import { DemoOnly } from "../../demo-only";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { money } from "@/lib/format";
import { StatusBadge, statusLabel } from "../../status-badge";

async function update(formData: FormData) {
  "use server";
  const { db } = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const tracking = String(formData.get("tracking") ?? "").trim() || null;
  await db.from("orders").update({ status, tracking_code: tracking }).eq("id", id);
  redirect(`/admin/pedidos/${id}?ok=1`);
}

export default async function OrderDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const { id } = await params;
  const { ok } = await searchParams;
  const { db, demo } = await requireAdmin();
  if (demo) return <DemoOnly />;
  const { data: o } = await db.from("orders").select("*, items:order_items(*)").eq("id", id).maybeSingle();
  if (!o) notFound();
  const a = o.address as Record<string, string>;
  const doc = String(o.customer_document);

  return (
    <>
      <Link href="/admin/pedidos" className="text-sm font-semibold text-muted hover:text-brand">← Pedidos</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold">Pedido #{o.code}</h1>
        <StatusBadge status={o.status} />
      </div>
      <p className="mt-1 text-sm text-muted">{new Date(o.created_at).toLocaleString("pt-BR")} · via {o.payment_provider}{o.paid_at ? ` · pago em ${new Date(o.paid_at).toLocaleString("pt-BR")}` : ""}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-6 ring-1 ring-line">
            <h2 className="font-bold">Itens</h2>
            <ul className="mt-3 divide-y divide-line text-sm">
              {o.items.map((i: { id: string; qty: number; name: string; unit_price: number }) => (
                <li key={i.id} className="flex justify-between gap-4 py-3"><span>{i.qty}x {i.name}</span><span className="font-semibold">{money(Number(i.unit_price) * i.qty)}</span></li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{money(Number(o.subtotal))}</span></div>
              <div className="flex justify-between"><span className="text-muted">Desconto</span><span>−{money(Number(o.discount))}</span></div>
              <div className="flex justify-between"><span className="text-muted">Frete</span><span>{money(Number(o.shipping))}</span></div>
              <div className="flex justify-between pt-1 text-base font-extrabold"><span>Total</span><span>{money(Number(o.total))}</span></div>
            </div>
          </section>
          <section className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 text-sm ring-1 ring-line">
              <h2 className="mb-3 font-bold">Cliente</h2>
              <p className="font-semibold">{o.customer_name}</p>
              <p>{o.customer_email}</p>
              <p>{o.customer_phone}</p>
              <p className="text-muted">CPF {doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</p>
            </div>
            <div className="rounded-3xl bg-white p-6 text-sm ring-1 ring-line">
              <h2 className="mb-3 font-bold">Entrega</h2>
              <p>{a.street}, {a.number}{a.complement ? ` · ${a.complement}` : ""}</p>
              <p>{a.district}</p>
              <p>{a.city}/{a.state}</p>
              <p className="text-muted">CEP {a.cep}</p>
            </div>
          </section>
        </div>

        <form action={update} className="h-fit space-y-4 rounded-3xl bg-white p-6 ring-1 ring-line">
          <h2 className="font-bold">Atualizar pedido</h2>
          <input type="hidden" name="id" value={o.id} />
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-muted">Status</span>
            <select name="status" defaultValue={o.status} className="input">
              {["pending", "paid", "shipped", "delivered", "canceled"].map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-muted">Código de rastreio</span>
            <input name="tracking" defaultValue={o.tracking_code ?? ""} className="input" placeholder="Ex.: AA123456789BR" />
          </label>
          {ok && <p className="rounded-xl bg-brand-soft px-4 py-2.5 text-sm font-semibold text-brand">Pedido atualizado.</p>}
          <button className="btn btn-primary w-full">Salvar</button>
          <Link href={`/pedido/${o.id}`} target="_blank" className="block text-center text-xs font-bold text-muted hover:text-brand">Ver página do cliente ↗</Link>
        </form>
      </div>
    </>
  );
}
