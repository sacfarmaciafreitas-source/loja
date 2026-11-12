import "server-only";
import { getProductsByIds } from "./data";
import { onlyDigits, pixPrice, shippingFor } from "./format";
import { payments } from "./payments";
import { getSettings } from "./settings";
import { dbAdmin, isDemo } from "./supabase";
import type { Order, OrderItem, OrderStatus } from "./types";

export type CheckoutInput = {
  name: string;
  email: string;
  phone: string;
  document: string;
  address: { cep: string; street: string; number: string; complement?: string; district: string; city: string; state: string };
  items: { productId: string; qty: number }[];
};

// Em modo demo os pedidos ficam em memória (somem ao reiniciar).
const g = globalThis as unknown as { __demoOrders?: Map<string, Order> };
const demoOrders = (g.__demoOrders ??= new Map());

const round = (v: number) => Math.round(v * 100) / 100;

export async function createOrder(input: CheckoutInput): Promise<Order> {
  if (!input.items.length) throw new Error("Carrinho vazio");

  // Preço SEMPRE recalculado no servidor a partir do banco, nunca do navegador
  const products = await getProductsByIds(input.items.map((i) => i.productId));
  const items: OrderItem[] = input.items.map((i) => {
    const p = products.find((x) => x.id === i.productId);
    if (!p || !p.active) throw new Error("Um produto do carrinho não está mais disponível");
    if (p.stock < i.qty) throw new Error(`Estoque insuficiente para ${p.name}`);
    return { product_id: p.id, name: p.name, unit_price: p.price, qty: Math.max(1, Math.floor(i.qty)) };
  });

  const settings = await getSettings();
  const c = settings.commerce;
  const subtotal = round(items.reduce((a, i) => a + i.unit_price * i.qty, 0));
  if (c.minOrder > 0 && subtotal < c.minOrder) throw new Error(`Pedido mínimo de R$ ${c.minOrder.toFixed(2).replace(".", ",")}`);
  const shipping = shippingFor(subtotal, c);
  const discount = round(subtotal - pixPrice(subtotal, c));
  const total = round(subtotal - discount + shipping);
  const provider = await payments();

  const base = {
    status: "pending" as OrderStatus,
    customer_name: input.name.trim(),
    customer_email: input.email.trim().toLowerCase(),
    customer_phone: onlyDigits(input.phone),
    customer_document: onlyDigits(input.document),
    address: input.address,
    subtotal,
    shipping,
    discount,
    total,
    payment_provider: provider.name,
  };

  let order: Order;
  if (isDemo) {
    const id = crypto.randomUUID();
    order = { ...base, id, code: id.slice(0, 8).toUpperCase(), payment_id: null, pix_code: null, tracking_code: null, created_at: new Date().toISOString(), paid_at: null, items };
  } else {
    const db = dbAdmin();
    const { data, error } = await db.from("orders").insert(base).select().single();
    if (error) throw error;
    order = data as Order;
    const { error: e2 } = await db.from("order_items").insert(items.map((i) => ({ ...i, order_id: order.id })));
    if (e2) throw e2;
    order.items = items;
  }

  const charge = await provider.createPixCharge({
    orderId: order.id,
    orderCode: order.code,
    amount: total,
    customer: { name: base.customer_name, email: base.customer_email, document: base.customer_document, phone: base.customer_phone },
    description: `Pedido ${order.code} - ${settings.brand.name}`,
    expiresMinutes: c.pixExpiresMinutes,
  });
  order.payment_id = charge.id;
  order.pix_code = charge.pixCode;

  if (isDemo) demoOrders.set(order.id, order);
  else await dbAdmin().from("orders").update({ payment_id: charge.id, pix_code: charge.pixCode }).eq("id", order.id);

  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  if (isDemo) return demoOrders.get(id) ?? null;
  const { data } = await dbAdmin().from("orders").select("*, items:order_items(*)").eq("id", id).maybeSingle();
  return (data as Order) ?? null;
}

export async function findOrdersByEmail(email: string, code: string): Promise<Order | null> {
  if (isDemo) return [...demoOrders.values()].find((o) => o.customer_email === email.toLowerCase() && o.code === code.toUpperCase()) ?? null;
  const { data } = await dbAdmin().from("orders").select("*, items:order_items(*)").eq("customer_email", email.trim().toLowerCase()).eq("code", code.trim().toUpperCase()).maybeSingle();
  return (data as Order) ?? null;
}

export async function markPaidByCharge(chargeId: string) {
  if (isDemo) {
    const o = [...demoOrders.values()].find((x) => x.payment_id === chargeId);
    if (o && o.status === "pending") Object.assign(o, { status: "paid", paid_at: new Date().toISOString() });
    return o ?? null;
  }
  const db = dbAdmin();
  const { data } = await db.from("orders").update({ status: "paid", paid_at: new Date().toISOString() }).eq("payment_id", chargeId).eq("status", "pending").select("id").maybeSingle();
  if (data) {
    // baixa de estoque
    const { data: items } = await db.from("order_items").select("product_id,qty").eq("order_id", data.id);
    for (const it of items ?? []) {
      if (!it.product_id) continue;
      const { data: p } = await db.from("products").select("stock").eq("id", it.product_id).single();
      if (p) await db.from("products").update({ stock: Math.max(0, p.stock - it.qty) }).eq("id", it.product_id);
    }
  }
  return data;
}
