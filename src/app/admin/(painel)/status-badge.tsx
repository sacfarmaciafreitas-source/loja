const map: Record<string, [string, string]> = {
  pending: ["Aguardando Pix", "bg-amber-100 text-amber-800"],
  paid: ["Pago", "bg-emerald-100 text-emerald-800"],
  shipped: ["Enviado", "bg-sky-100 text-sky-800"],
  delivered: ["Entregue", "bg-zinc-200 text-zinc-800"],
  canceled: ["Cancelado", "bg-rose-100 text-rose-800"],
};

export const statusLabel = (s: string) => map[s]?.[0] ?? s;

export function StatusBadge({ status }: { status: string }) {
  const [l, c] = map[status] ?? [status, "bg-zinc-100"];
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${c}`}>{l}</span>;
}
