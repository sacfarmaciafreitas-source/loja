"use client";

import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
