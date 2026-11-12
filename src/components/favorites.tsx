"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { IconHeart } from "./icons";

const KEY = "favs:v1";
type Ctx = { ids: string[]; toggle: (id: string) => void; has: (id: string) => boolean };
const FavCtx = createContext<Ctx | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      setIds(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {}
  }, []);
  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);
  return <FavCtx.Provider value={{ ids, toggle, has: (id) => ids.includes(id) }}>{children}</FavCtx.Provider>;
}

export const useFavorites = () => {
  const c = useContext(FavCtx);
  if (!c) throw new Error("useFavorites fora do provider");
  return c;
};

export function FavButton({ id, className = "" }: { id: string; className?: string }) {
  const { has, toggle } = useFavorites();
  const on = has(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggle(id);
      }}
      aria-label={on ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={`grid h-8 w-8 place-items-center rounded-full bg-white text-ink/70 shadow-sm ring-1 ring-line transition hover:scale-110 hover:text-accent ${on ? "text-accent" : ""} ${className}`}
    >
      <IconHeart width={16} height={16} fill={on ? "currentColor" : "none"} />
    </button>
  );
}
