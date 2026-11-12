import { DemoOnly } from "./demo-only";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { money } from "@/lib/format";
import { StatusBadge } from "./status-badge";

export default async function Dashboard() {
  const { db, demo } = await requireAdmin();
  if (demo) return <DemoOnly />;
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [{ data: orders }, { count: products }] = await Promise.all([
    db.from("orders").select("id,code,status,customer_name,total,created_at").gte("created_at", since).order("created_at", { ascending: false }),
    db.from("products").select("id", { count: "exact", head: true }).eq("active", true),
  ]);
  const list = orders ?? [];
  const paid = list.filter((o) => ["paid", "shipped", "delivered"].includes(o.status));
  const revenue = paid.reduce((a, o) => a + Number(o.total), 0);

  const cards = [
    ["Faturamento 30 dias", money(revenue)],
    ["Pedidos pagos", String(paid.length)],
    ["Conversão Pix", list.length ? `${Math.round((paid.length / list.length) * 100)}%` : "0%"],
    ["Produtos ativos", String(products ?? 0)],
  ];

  return (
    <>
      <h1 className="text-2xl font-extrabold">Visão geral</h1>
      <div className="stagger mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([l, v]) => (
          <div key={l} className="rounded-3xl bg-white p-5 ring-1 ring-line">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">{l}</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-3xl bg-white ring-1 ring-line">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-bold">Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="text-sm font-bold text-brand">Ver todos</Link>
        </div>
        <ul className="divide-y divide-line">
          {list.slice(0, 8).map((o) => (
            <li key={o.id}>
              <Link href={`/admin/pedidos/${o.id}`} className="flex items-center gap-4 px-5 py-3.5 text-sm hover:bg-surface">
                <span className="font-mono font-bold">#{o.code}</span>
                <span className="flex-1 truncate">{o.customer_name}</span>
                <StatusBadge status={o.status} />
                <span className="w-24 text-right font-bold">{money(Number(o.total))}</span>
              </Link>
            </li>
          ))}
          {!list.length && <li className="px-5 py-10 text-center text-sm text-muted">Nenhum pedido ainda.</li>}
        </ul>
      </div>
    </>
  );
}
