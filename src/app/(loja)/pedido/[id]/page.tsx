import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { getOrder } from "@/lib/orders";
import { money } from "@/lib/format";
import { IconCheck } from "@/components/icons";
import { PixBox } from "./pix-box";
import { PurchaseTracker } from "./purchase-tracker";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Seu pedido", robots: { index: false } };

const steps = [
  ["pending", "Aguardando pagamento"],
  ["paid", "Pagamento aprovado"],
  ["shipped", "Enviado"],
  ["delivered", "Entregue"],
] as const;

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const order = await getOrder((await params).id);
  if (!order) notFound();
  const qr = order.pix_code ? await QRCode.toDataURL(order.pix_code, { margin: 1, width: 320 }) : null;
  const idx = steps.findIndex(([s]) => s === order.status);
  const canceled = order.status === "canceled";

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <div className="animate-rise text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Pedido #{order.code}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          {canceled ? "Pedido cancelado" : order.status === "pending" ? "Falta só o Pix" : "Obrigado pela compra!"}
        </h1>
      </div>

      {!canceled && (
        <ol className="mt-8 grid grid-cols-4 gap-2">
          {steps.map(([s, l], i) => (
            <li key={s} className="text-center">
              <div className={`mx-auto grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition ${i <= idx ? "bg-brand text-brand-ink" : "bg-white text-muted ring-1 ring-line"}`}>
                {i < idx || (i === idx && i > 0) ? <IconCheck width={16} /> : i + 1}
              </div>
              <p className={`mt-2 text-[11px] font-semibold leading-tight ${i <= idx ? "text-ink" : "text-muted"}`}>{l}</p>
            </li>
          ))}
        </ol>
      )}

      {order.status === "pending" && order.pix_code && qr && (
        <PixBox orderId={order.id} code={order.pix_code} qr={qr} total={order.total} mock={order.payment_provider === "mock"} />
      )}

      {["paid", "shipped", "delivered"].includes(order.status) && (
        <PurchaseTracker id={order.id} code={order.code} total={Number(order.total)} items={(order.items ?? []).map((i) => ({ id: i.product_id, name: i.name, price: Number(i.unit_price), qty: i.qty }))} />
      )}

      {order.tracking_code && (
        <div className="mt-6 rounded-3xl bg-white p-6 text-center ring-1 ring-line">
          <p className="text-sm text-muted">Código de rastreio</p>
          <p className="mt-1 font-mono text-xl font-bold">{order.tracking_code}</p>
        </div>
      )}

      <div className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-line">
        <h2 className="font-bold">Itens</h2>
        <ul className="mt-3 divide-y divide-line">
          {order.items?.map((i, k) => (
            <li key={k} className="flex justify-between gap-4 py-3 text-sm"><span>{i.qty}x {i.name}</span><span className="font-semibold">{money(Number(i.unit_price) * i.qty)}</span></li>
          ))}
        </ul>
        <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{money(Number(order.subtotal))}</span></div>
          <div className="flex justify-between"><span className="text-muted">Desconto Pix</span><span>−{money(Number(order.discount))}</span></div>
          <div className="flex justify-between"><span className="text-muted">Frete</span><span>{Number(order.shipping) ? money(Number(order.shipping)) : "Grátis"}</span></div>
          <div className="flex justify-between pt-1 text-base font-extrabold"><span>Total</span><span>{money(Number(order.total))}</span></div>
        </div>
        <p className="mt-5 text-xs text-muted">
          Entrega para {order.customer_name}: {order.address.street}, {order.address.number} · {order.address.city}/{order.address.state}
        </p>
      </div>
      <p className="mt-6 text-center text-xs text-muted">Guarde este link ou use o número do pedido e seu e-mail em “Meus pedidos”.</p>
    </div>
  );
}
