"use server";

import { createOrder, type CheckoutInput } from "@/lib/orders";
import { onlyDigits } from "@/lib/format";

function validCpf(raw: string) {
  const c = onlyDigits(raw);
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  const dv = (n: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += Number(c[i]) * (n + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === Number(c[9]) && dv(10) === Number(c[10]);
}

export async function placeOrder(input: CheckoutInput): Promise<{ id?: string; error?: string }> {
  try {
    if (input.name.trim().split(/\s+/).length < 2) return { error: "Informe nome e sobrenome." };
    if (!/^\S+@\S+\.\S+$/.test(input.email)) return { error: "E-mail inválido." };
    if (!validCpf(input.document)) return { error: "CPF inválido." };
    if (onlyDigits(input.phone).length < 10) return { error: "Telefone inválido." };
    const a = input.address;
    if (onlyDigits(a.cep).length !== 8 || !a.street || !a.number || !a.city || !a.state) return { error: "Preencha o endereço completo." };
    const order = await createOrder(input);
    return { id: order.id };
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : "Não foi possível criar o pedido." };
  }
}
