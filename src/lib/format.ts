import type { Settings } from "./settings-types";

type Commerce = Settings["commerce"];

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const money = (v: number) => brl.format(v);

export const pixPrice = (v: number, c: Pick<Commerce, "pixDiscountPercent">) =>
  Math.round(v * (1 - c.pixDiscountPercent / 100) * 100) / 100;

export const installment = (v: number, c: Pick<Commerce, "maxInstallments">) =>
  `${c.maxInstallments}x de ${money(v / c.maxInstallments)}`;

export const discountPct = (price: number, compare?: number | null) =>
  compare && compare > price ? Math.round((1 - price / compare) * 100) : 0;

export const shippingFor = (subtotal: number, c: Pick<Commerce, "freeShippingFrom" | "flatShipping">) =>
  c.freeShippingFrom > 0 && subtotal >= c.freeShippingFrom ? 0 : c.flatShipping;

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const onlyDigits = (s: string) => s.replace(/\D/g, "");
