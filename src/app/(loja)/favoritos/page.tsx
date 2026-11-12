"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useFavorites } from "@/components/favorites";
import { IconHeart } from "@/components/icons";
import { ProductGrid } from "@/components/product-grid";
import type { Product } from "@/lib/types";
import { getFavoriteProducts } from "./actions";

export default function Favorites() {
  const { ids } = useFavorites();
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    getFavoriteProducts(ids).then(setProducts);
  }, [ids]);

  return (
    <div className="container-store pt-6">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-[28px]">Meus favoritos</h1>
      {products === null ? (
        <p className="py-20 text-center text-muted">Carregando...</p>
      ) : products.length ? (
        <div className="mt-5"><ProductGrid products={products} /></div>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-soft text-brand"><IconHeart width={28} height={28} /></span>
          <p className="mt-4 font-bold">Nenhum favorito ainda</p>
          <p className="mt-1 text-sm text-muted">Toque no coração dos produtos para salvar aqui.</p>
          <Link href="/" className="btn btn-primary mt-6">Ver produtos</Link>
        </div>
      )}
    </div>
  );
}
