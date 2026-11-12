"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { IconChevron } from "./icons";
import { ProductCard } from "./product-card";

export function ProductRail({ title, subtitle, href, products }: { title: string; subtitle?: string; href?: string; products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  useEffect(update, [products.length]);

  const go = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });

  if (!products.length) return null;
  return (
    <section className="container-store mt-14 animate-rise">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-extrabold tracking-tight md:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[13.5px] text-muted">{subtitle}</p>}
        </div>
        {href && <Link href={href} className="shrink-0 text-[13.5px] font-semibold text-brand hover:underline">Ver todos</Link>}
      </div>
      <div className="relative">
        <div ref={ref} onScroll={update} className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-2">
          {products.map((p) => (
            <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[23.5%] lg:w-[15.9%]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        {!edge.start && (
          <button onClick={() => go(-1)} aria-label="Anterior" className="absolute -left-3 top-[42%] hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-white shadow-md transition hover:text-brand md:grid">
            <IconChevron width={18} height={18} className="rotate-180" />
          </button>
        )}
        {!edge.end && (
          <button onClick={() => go(1)} aria-label="Próximo" className="absolute -right-3 top-[42%] hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-white shadow-md transition hover:text-brand md:grid">
            <IconChevron width={18} height={18} />
          </button>
        )}
      </div>
    </section>
  );
}
