"use client";

import { useState } from "react";
import { useCart } from "./cart";
import { IconBag, IconCheck } from "./icons";
import type { Product } from "@/lib/types";
import { useSettings } from "./settings-context";
import { trackEvent } from "./tracking";

export function AddToCart({ product, variant = "card", qty = 1 }: { product: Product; variant?: "card" | "page"; qty?: number }) {
  const { add } = useCart();
  const { settings } = useSettings();
  const [done, setDone] = useState(false);
  const out = product.stock <= 0;

  const onClick = () => {
    add({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image_url: product.image_url }, qty);
    trackEvent("add_to_cart", { value: product.price * qty, items: [{ id: product.sku || product.id, name: product.name, price: product.price, qty }] }, settings.tracking);
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  };

  if (variant === "page") {
    return (
      <button onClick={onClick} disabled={out} className="btn btn-primary w-full py-3.5 text-base">
        {out ? "Esgotado" : done ? <><IconCheck /> Adicionado</> : <><IconBag /> Adicionar ao carrinho</>}
      </button>
    );
  }

  return (
    <button onClick={onClick} disabled={out} className="btn btn-primary w-full !px-2 !py-2.5 !text-[13px]">
      {out ? "Esgotado" : done ? <><IconCheck width={16} height={16} /> Adicionado</> : "Adicionar ao carrinho"}
    </button>
  );
}
