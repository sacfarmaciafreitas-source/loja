"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart";
import { useFavorites } from "./favorites";
import { DynIcon, IconBag, IconChevronDown, IconClose, IconHeadset, IconHeart, IconMenu, IconSearch, IconTruck } from "./icons";
import { Logo } from "./logo";
import { useSettings } from "./settings-context";
import type { Category } from "@/lib/types";

export function Header() {
  const { settings: s, categories } = useSettings();
  const { count, setOpen } = useCart();
  const { ids } = useFavorites();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [shadow, setShadow] = useState(false);
  const [menu, setMenu] = useState(false);
  const [cats, setCats] = useState(false);
  const catsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const on = () => setShadow(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    const close = (e: MouseEvent) => catsRef.current && !catsRef.current.contains(e.target as Node) && setCats(false);
    document.addEventListener("click", close);
    return () => {
      window.removeEventListener("scroll", on);
      document.removeEventListener("click", close);
    };
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/busca?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      {s.topbar.messages.length > 0 && (
        <div className="bg-brand-dark text-brand-ink">
          <div className="container-store flex items-center justify-start gap-6 overflow-x-auto md:justify-center py-2 text-[12px] font-semibold no-scrollbar">
            {s.topbar.messages.map((m, i) => (
              <span key={i} className="flex shrink-0 items-center gap-1.5">
                {m.icon && <DynIcon name={m.icon} width={14} height={14} />} {m.text}
              </span>
            ))}
          </div>
        </div>
      )}

      <header className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${shadow ? "shadow-[0_6px_20px_-12px_rgba(0,0,0,0.25)]" : ""}`}>
        <div className="container-store flex items-center gap-4 py-3 md:gap-6 md:py-3.5">
          <button className="text-ink md:hidden" onClick={() => setMenu(true)} aria-label="Menu"><IconMenu /></button>
          <Logo brand={s.brand} />

          <form onSubmit={submit} className="relative hidden flex-1 md:block">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/60" width={18} height={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busque produtos, marcas ou categorias"
              className="w-full rounded-full border border-line bg-white py-2.5 pl-11 pr-28 text-[15px] outline-none transition focus:border-brand focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand)_15%,transparent)]"
            />
            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-brand px-5 py-1.5 text-sm font-semibold text-brand-ink transition hover:brightness-110">Buscar</button>
          </form>

          <nav className="ml-auto flex items-center gap-1 md:ml-0 md:gap-3">
            <Link href="/contato" className="hidden items-center gap-2 rounded-lg px-2 py-1 lg:flex">
              <IconHeadset width={20} height={20} className="text-brand" />
              <span className="leading-tight"><span className="block text-[11px] text-muted">Precisa de ajuda?</span><span className="text-[13px] font-semibold">Atendimento</span></span>
            </Link>
            <Link href="/meus-pedidos" className="hidden items-center gap-2 rounded-lg px-2 py-1 md:flex">
              <IconTruck width={20} height={20} className="text-brand" />
              <span className="leading-tight"><span className="block text-[11px] text-muted">Onde está meu produto?</span><span className="text-[13px] font-semibold">Acompanhar pedido</span></span>
            </Link>
            <Link href="/favoritos" className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-soft" aria-label="Favoritos">
              <IconHeart width={21} height={21} />
              {ids.length > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">{ids.length}</span>}
            </Link>
            <button onClick={() => setOpen(true)} className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-soft" aria-label="Carrinho">
              <IconBag width={23} height={23} />
              <span key={count} className="pop absolute right-0 top-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-ink">{count}</span>
            </button>
          </nav>
        </div>

        <form onSubmit={submit} className="container-store relative pb-3 md:hidden">
          <IconSearch className="pointer-events-none absolute left-8 top-[42%] -translate-y-1/2 text-ink/50" width={17} height={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busque produtos ou marcas" className="w-full rounded-full border border-line bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-brand" />
        </form>

        <div className="hidden border-y border-line md:block">
          <div className="container-store flex items-center gap-6">
            <div ref={catsRef} className="relative">
              <button onClick={() => setCats((v) => !v)} className="flex items-center gap-2 py-2.5 text-[13px] font-bold uppercase tracking-wide text-brand">
                <IconMenu width={17} height={17} /> Todas as categorias <IconChevronDown width={15} height={15} className={`transition ${cats ? "rotate-180" : ""}`} />
              </button>
              {cats && <MegaMenu categories={categories} onClose={() => setCats(false)} />}
            </div>
            <nav className="flex items-center gap-5 overflow-x-auto no-scrollbar">
              {s.menu.map((m, i) => (
                <Link key={i} href={m.href} className="shrink-0 py-2.5 text-[13.5px] font-medium text-ink transition hover:text-brand">{m.label}</Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {menu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 animate-fade bg-black/40" onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[84%] max-w-xs animate-rise flex-col overflow-y-auto bg-white">
            <div className="flex items-center justify-between border-b border-line p-4">
              <Logo brand={s.brand} height={36} />
              <button onClick={() => setMenu(false)} aria-label="Fechar"><IconClose /></button>
            </div>
            <p className="px-4 pb-1 pt-4 text-[11px] font-bold uppercase tracking-wider text-muted">Categorias</p>
            {categories.filter((c) => !c.parent_id).map((c) => (
              <Link key={c.id} href={`/c/${c.slug}`} onClick={() => setMenu(false)} className="px-4 py-2.5 text-[15px] font-medium hover:text-brand">{c.name}</Link>
            ))}
            <p className="px-4 pb-1 pt-5 text-[11px] font-bold uppercase tracking-wider text-muted">Menu</p>
            {s.menu.map((m, i) => (
              <Link key={i} href={m.href} onClick={() => setMenu(false)} className="px-4 py-2.5 text-[15px] font-medium hover:text-brand">{m.label}</Link>
            ))}
            <Link href="/meus-pedidos" onClick={() => setMenu(false)} className="m-4 mt-6 btn btn-primary">Acompanhar pedido</Link>
          </div>
        </div>
      )}
    </>
  );
}

function MegaMenu({ categories, onClose }: { categories: Category[]; onClose: () => void }) {
  const top = categories.filter((c) => !c.parent_id);
  const [hover, setHover] = useState<string | null>(top[0]?.id ?? null);
  const kids = categories.filter((c) => c.parent_id === hover);
  return (
    <div className="absolute left-0 top-full z-50 flex animate-rise overflow-hidden rounded-[var(--radius)] border border-line bg-white shadow-xl">
      <div className="max-h-[70vh] w-60 overflow-y-auto border-r border-line p-2">
        {top.map((c) => (
          <Link key={c.id} href={`/c/${c.slug}`} onMouseEnter={() => setHover(c.id)} onClick={onClose} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${hover === c.id ? "bg-soft text-brand" : ""}`}>
            {c.name} {categories.some((k) => k.parent_id === c.id) && <span className="text-muted">›</span>}
          </Link>
        ))}
      </div>
      {kids.length > 0 && (
        <div className="max-h-[70vh] w-[min(560px,60vw)] overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            {kids.map((k) => (
              <div key={k.id} className="py-1">
                <Link href={`/c/${k.slug}`} onClick={onClose} className="text-[13.5px] font-bold hover:text-brand">{k.name}</Link>
                {categories.filter((g) => g.parent_id === k.id).slice(0, 6).map((g) => (
                  <Link key={g.id} href={`/c/${g.slug}`} onClick={onClose} className="block py-0.5 text-[12.5px] text-muted hover:text-brand">{g.name}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
