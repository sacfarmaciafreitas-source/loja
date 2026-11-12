"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS } from "./configuracoes/sections";

const main = [
  ["Visão geral", "/admin"],
  ["Pedidos", "/admin/pedidos"],
  ["Produtos", "/admin/produtos"],
  ["Importar de outra loja", "/admin/produtos/importar-loja"],
  ["Importar CSV", "/admin/produtos/importar"],
  ["Categorias", "/admin/categorias"],
  ["Newsletter", "/admin/newsletter"],
];

export function AdminNav() {
  const path = usePathname();
  const groups = [...new Set(SECTIONS.map((s) => s.group))];
  const item = (label: string, href: string) => {
    const active = href === "/admin" ? path === "/admin" : path === href || (path.startsWith(href + "/") && href !== "/admin/produtos") || (href === "/admin/produtos" && path.startsWith("/admin/produtos") && !path.startsWith("/admin/produtos/importar"));
    return (
      <Link key={href} href={href} className={`block rounded-lg px-3 py-2 text-[13.5px] font-medium transition ${active ? "bg-soft font-bold text-brand" : "text-ink/80 hover:bg-zinc-100"}`}>
        {label}
      </Link>
    );
  };
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto p-3 md:block md:space-y-0.5">
      {main.map(([l, h]) => item(l, h))}
      {groups.map((g) => (
        <div key={g} className="contents md:block">
          <p className="hidden px-3 pb-1 pt-5 text-[10.5px] font-bold uppercase tracking-wider text-muted md:block">{g}</p>
          {SECTIONS.filter((s) => s.group === g).map((s) => item(s.title, `/admin/configuracoes/${s.slug}`))}
        </div>
      ))}
      <a href="/" target="_blank" className="block rounded-lg px-3 py-2 text-[13.5px] font-medium text-muted hover:text-brand md:mt-4">Ver loja ↗</a>
    </nav>
  );
}
