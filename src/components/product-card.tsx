"use client";

import Link from "next/link";
import { discountPct, money, pixPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToCart } from "./add-to-cart";
import { FavButton } from "./favorites";
import { ProductImage } from "./product-image";
import { useSettings } from "./settings-context";

export function ProductCard({ product }: { product: Product }) {
  const { settings } = useSettings();
  const c = settings.commerce;
  const off = discountPct(product.price, product.compare_at_price);
  return (
    <article className="card-lift group relative flex h-full flex-col rounded-[var(--radius)] border border-line bg-white p-2.5">
      <Link href={`/p/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-[calc(var(--radius)*0.7)] bg-white">
        <ProductImage src={product.image_url} name={product.name} className="transition duration-500 group-hover:scale-[1.05]" />
        {off > 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">-{off}%</span>}
      </Link>
      <FavButton id={product.id} className="absolute right-4 top-4" />
      <div className="flex flex-1 flex-col px-1 pt-2.5">
        <Link href={`/p/${product.slug}`} className="line-clamp-2 min-h-[2.5rem] text-[13.5px] font-medium leading-[1.3rem] hover:text-brand">
          {product.name}
        </Link>
        <div className="mt-2">
          {off > 0 && <span className="mr-1.5 text-[12px] text-muted line-through">{money(product.compare_at_price!)}</span>}
          <span className="text-[17px] font-extrabold text-brand">{money(product.price)}</span>
        </div>
        {c.cardEnabled && <p className="text-[11.5px] text-muted">em até {c.maxInstallments}x no cartão</p>}
        <p className="text-[11.5px] font-bold text-brand">{money(pixPrice(product.price, c))} no PIX</p>
        <div className="mt-auto pt-2.5"><AddToCart product={product} /></div>
      </div>
    </article>
  );
}
