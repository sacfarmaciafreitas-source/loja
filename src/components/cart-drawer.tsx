"use client";

import Link from "next/link";
import { useEffect } from "react";
import { money, pixPrice, shippingFor } from "@/lib/format";
import { useCart } from "./cart";
import { IconBag, IconClose } from "./icons";
import { ProductImage } from "./product-image";
import { useSettings } from "./settings-context";

export function CartDrawer() {
  const { settings } = useSettings();
  const c = settings.commerce;
  const { items, open, setOpen, setQty, remove, subtotal } = useCart();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, setOpen]);

  const free = c.freeShippingFrom > 0;
  const missing = Math.max(0, c.freeShippingFrom - subtotal);
  const progress = free ? Math.min(100, (subtotal / c.freeShippingFrom) * 100) : 0;
  const ship = shippingFor(subtotal, c);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${open ? "translate-x-0" : "invisible translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-extrabold">Meu carrinho <span className="text-muted">({items.reduce((a, i) => a + i.qty, 0)})</span></h2>
          <button onClick={() => setOpen(false)} aria-label="Fechar"><IconClose /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-soft text-brand"><IconBag width={28} height={28} /></div>
            <p className="font-bold">Seu carrinho está vazio</p>
            <p className="text-sm text-muted">Escolha seus produtos e finalize o pedido por aqui.</p>
            <button onClick={() => setOpen(false)} className="btn btn-primary mt-2">Ver ofertas</button>
          </div>
        ) : (
          <>
            {free && (
              <div className="border-b border-line bg-soft/60 px-5 py-3">
                <p className="text-[13px]">{missing > 0 ? <>Faltam <b>{money(missing)}</b> para ganhar frete grátis</> : <b className="text-brand">Você ganhou frete grátis!</b>}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((i) => (
                <li key={i.productId} className="flex gap-3 py-4">
                  <Link href={`/p/${i.slug}`} onClick={() => setOpen(false)} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line">
                    <ProductImage src={i.image_url} name={i.name} />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="line-clamp-2 text-[13.5px] font-medium leading-snug">{i.name}</p>
                    <p className="mt-1 text-[15px] font-extrabold text-brand">{money(i.price)}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-line">
                        <button onClick={() => setQty(i.productId, i.qty - 1)} className="px-3 py-1 text-lg leading-none" aria-label="Diminuir">−</button>
                        <span className="w-6 text-center text-sm font-bold">{i.qty}</span>
                        <button onClick={() => setQty(i.productId, i.qty + 1)} className="px-3 py-1 text-lg leading-none" aria-label="Aumentar">+</button>
                      </div>
                      <button onClick={() => remove(i.productId)} className="text-xs font-semibold text-muted hover:text-accent">Remover</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-1.5 border-t border-line px-5 py-5">
              <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span className="font-semibold">{money(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Frete</span><span className="font-semibold">{ship === 0 ? "Grátis" : money(ship)}</span></div>
              <div className="flex justify-between pt-1"><span className="font-bold">Total no Pix</span><span className="text-lg font-extrabold text-brand">{money(pixPrice(subtotal, c) + ship)}</span></div>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-primary mt-3 w-full py-3.5 text-base">Finalizar compra</Link>
              <button onClick={() => setOpen(false)} className="w-full pt-2 text-center text-[13px] font-semibold text-muted hover:text-brand">Continuar comprando</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
