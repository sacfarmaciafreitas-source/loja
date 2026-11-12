"use server";

import { getProducts } from "@/lib/data";

export async function getFavoriteProducts(ids: string[]) {
  if (!ids.length) return [];
  return getProducts({ ids: ids.slice(0, 100) });
}
