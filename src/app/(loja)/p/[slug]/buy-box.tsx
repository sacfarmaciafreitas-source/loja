"use client";

import { useEffect, useState } from "react";
import { AddToCart } from "@/components/add-to-cart";
import { FavButton } from "@/components/favorites";
import { IconPix, IconShield, IconTruck, IconCard } from "@/components/icons";
import { useSettings } from "@/components/settings-context";
import { trackEvent } from "@/components/tracking";
import { discountPct, installment, money, pixPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function BuyBox({ product }: { product: Product }) {
  const { settings: s } = useSettings();
  const c = s.commerce;
  const [qty, setQty] = useState(1);
  const off = discountPct(product.price, product.compare_at_price);

  useEffect(() => {
    trackEvent("view_item", { value: product.price, id: product.sku || product.id, items: [{ id: product.sku || product.id, name: product.name, price: product.price, qty: 1 }] }, s.tracking);
  }, [product, s.tracking]);

  return (
    <div className="stagger">
      <div className="flex items-start justify-between gap-3">
        <div>
          {product.brand && <p className="text-[12px] font-semibold uppercase tracking-wider text-brand">{product.brand}</p>}
          <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight md:text-[28px]">{product.name}</h1>
          {product.sku && <p className="mt-1.5 text-[12px] text-muted">Cód.: {product.sku}{product.gtin ? ` · EAN ${product.gtin}` : ""}</p>}
        </div>
        <FavButton id={product.id} className="!h-10 !w-10 shrink-0" />
      </div>

      <div className="mt-5 rounded-[var(--radius)] border border-line p-5">
        {off > 0 && (
          <p className="flex items-center gap-2 text-[13px] text-muted">
            <span className="line-through">{money(product.compare_at_price!)}</span>
            <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">-{off}%</span>
          </p>
        )}
        <p className="text-[34px] font-extrabold leading-tight tracking-tight text-brand">{money(product.price)}</p>
        {c.cardEnabled && <p className="flex items-center gap-1.5 text-[13px] text-muted"><IconCard width={15} height={15} /> ou {installment(product.price, c)} sem juros no cartão</p>}
        <div className="mt-3 flex items-center gap-3 rounded-[calc(var(--radius)*0.8)] bg-soft px-4 py-3 text-brand">
          <IconPix width={20} height={20} />
          <p className="text-[13.5px]"><b className="text-[16px]">{money(pixPrice(product.price, c))}</b> no PIX ({c.pixDiscountPercent}% de desconto)</p>
        </div>

        <div className="mt-5 flex gap-3">
          <div className="flex items-center rounded-full border border-line">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2 text-lg" aria-label="Diminuir">−</button>
            <span className="w-8 text-center font-bold">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))} className="px-4 py-2 text-lg" aria-label="Aumentar">+</button>
          </div>
          <div className="flex-1"><AddToCart product={product} variant="page" qty={qty} /></div>
        </div>
        <p className={`mt-3 text-center text-[12px] font-semibold ${product.stock > 0 ? "text-emerald-700" : "text-accent"}`}>
          {product.stock > 0 ? "Em estoque, pronto para envio" : "Produto indisponível no momento"}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 text-[12.5px]">
        <div className="flex items-center gap-2.5 rounded-[var(--radius)] border border-line p-3"><IconTruck width={20} height={20} className="shrink-0 text-brand" /> Entrega em {c.shippingDays}</div>
        <div className="flex items-center gap-2.5 rounded-[var(--radius)] border border-line p-3"><IconShield width={20} height={20} className="shrink-0 text-brand" /> Original com nota fiscal</div>
      </div>
    </div>
  );
}
