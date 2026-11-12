import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { findOrdersByEmail } from "@/lib/orders";

export const metadata: Metadata = { title: "Meus pedidos", robots: { index: false } };

async function lookup(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const code = String(formData.get("code") ?? "").replace("#", "");
  const order = await findOrdersByEmail(email, code);
  redirect(order ? `/pedido/${order.id}` : "/meus-pedidos?erro=1");
}

export default async function MyOrders({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 pt-14">
      <h1 className="animate-rise font-display text-4xl font-semibold tracking-tight">Acompanhar pedido</h1>
      <p className="mt-2 text-muted">Use o e-mail da compra e o número do pedido.</p>
      <form action={lookup} className="stagger mt-8 space-y-4 rounded-3xl bg-white p-6 ring-1 ring-line">
        <label className="block"><span className="mb-1.5 block text-xs font-bold text-muted">E-mail</span><input name="email" type="email" required className="input" /></label>
        <label className="block"><span className="mb-1.5 block text-xs font-bold text-muted">Número do pedido</span><input name="code" required className="input uppercase" placeholder="Ex.: 4F2A9C1B" /></label>
        {erro && <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">Pedido não encontrado. Confira os dados.</p>}
        <button className="btn btn-primary w-full">Ver meu pedido</button>
      </form>
    </div>
  );
}
