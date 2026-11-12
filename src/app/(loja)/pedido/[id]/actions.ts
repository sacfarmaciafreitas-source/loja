"use server";

import { getOrder, markPaidByCharge } from "@/lib/orders";

/** Só funciona quando o pedido foi criado pelo gateway de teste (mock). */
export async function simulatePayment(orderId: string) {
  const order = await getOrder(orderId);
  if (!order || order.payment_provider !== "mock" || !order.payment_id) return;
  await markPaidByCharge(order.payment_id);
}
