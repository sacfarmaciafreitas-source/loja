import { DemoOnly } from "../demo-only";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { money } from "@/lib/format";
import { StatusBadge } from "../status-badge";

const filters = [
  ["", "Todos"],
  ["pending", "Aguardando"],
  ["paid", "Pagos"],
  ["shipped", "Enviados"],
  ["delivered", "Entregues"],
  ["canceled", "Cancelados"],
];

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "", q = "" } = await searchParams;
  const { db, demo } = await requireAdmin();
  if (demo) return <DemoOnly />;
  let query = db.from("orders").select("id,code,status,customer_name,customer_email,total,created_at").order("created_at", { ascending: false }).limit(200);
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`code.ilike.%${q.replace(/[%,()]/g, "")}%,customer_email.ilike.%${q.replace(/[%,()]/g, "")}%,customer_name.ilike.%${q.replace(/[%,()]/g, "")}%`);
  const { data: orders } = await query;

  return (
    <>
      <h1 className="text-2xl font-extrabold">Pedidos</h1>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-full bg-white p-1 ring-1 ring-line">
          {filters.map(([v, l]) => (
            <Link key={v} href={`?status=${v}`} className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${status === v ? "bg-brand text-brand-ink" : "text-muted"}`}>{l}</Link>
          ))}
        </div>
        <form className="flex-1">
          <input type="hidden" name="status" value={status} />
          <input name="q" defaultValue={q} placeholder="Buscar por número, nome ou e-mail" className="input max-w-sm" />
        </form>
      </div>
      <div className="mt-6 overflow-x-auto rounded-3xl bg-white ring-1 ring-line">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
            <tr><th className="px-5 py-3">Pedido</th><th>Cliente</th><th>Data</th><th>Status</th><th className="px-5 text-right">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders?.map((o) => (
              <tr key={o.id} className="hover:bg-surface">
                <td className="px-5 py-3.5"><Link href={`/admin/pedidos/${o.id}`} className="font-mono font-bold text-brand">#{o.code}</Link></td>
                <td><p className="font-semibold">{o.customer_name}</p><p className="text-xs text-muted">{o.customer_email}</p></td>
                <td className="text-muted">{new Date(o.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</td>
                <td><StatusBadge status={o.status} /></td>
                <td className="px-5 text-right font-bold">{money(Number(o.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders?.length && <p className="px-5 py-12 text-center text-sm text-muted">Nenhum pedido encontrado.</p>}
      </div>
    </>
  );
}
