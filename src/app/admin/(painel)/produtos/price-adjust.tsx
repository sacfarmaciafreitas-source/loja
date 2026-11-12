"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { money } from "@/lib/format";
import { adjustPrices } from "./price-actions";

export function PriceAdjust({ categories }: { categories: { id: string; name: string; depth: number }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const [value, setValue] = useState("10");
  const [cat, setCat] = useState("");
  const [round90, setRound90] = useState(false);
  const [includeCompare, setIncludeCompare] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const pct = dir * Math.abs(Number(value.replace(",", ".")) || 0);
  const example = 100 * (1 + pct / 100);
  const exampleFinal = round90 ? Math.floor(example) + 0.9 : example;
  const catName = cat ? categories.find((c) => c.id === cat)?.name : "todos os produtos";

  const run = () =>
    start(async () => {
      const r = await adjustPrices({ pct, categoryId: cat, round90, includeCompare });
      setConfirm(false);
      setMsg(r.ok ? { ok: true, text: `${r.count} produtos atualizados.` } : { ok: false, text: r.error ?? "Erro" });
      if (r.ok) router.refresh();
    });

  if (!open) return <button onClick={() => setOpen(true)} className="btn btn-ghost">% Reajustar preços</button>;

  return (
    <div className="mt-4 w-full animate-rise rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-extrabold">Reajustar preços em massa</h2>
        <button onClick={() => { setOpen(false); setConfirm(false); }} className="text-sm font-semibold text-muted">Fechar</button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[auto_140px_1fr]">
        <div className="flex rounded-full border border-line p-1">
          <button onClick={() => setDir(1)} className={`rounded-full px-4 py-2 text-sm font-bold ${dir === 1 ? "bg-brand text-brand-ink" : "text-muted"}`}>Aumentar</button>
          <button onClick={() => setDir(-1)} className={`rounded-full px-4 py-2 text-sm font-bold ${dir === -1 ? "bg-accent text-white" : "text-muted"}`}>Diminuir</button>
        </div>
        <div className="relative">
          <input inputMode="decimal" value={value} onChange={(e) => { setValue(e.target.value); setConfirm(false); }} className="input pr-8 text-lg font-bold" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted">%</span>
        </div>
        <select value={cat} onChange={(e) => { setCat(e.target.value); setConfirm(false); }} className="input">
          <option value="">Todos os produtos</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{"  ".repeat(c.depth)}{c.name}</option>)}
        </select>
      </div>
      <div className="mt-3 flex flex-wrap gap-5 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={round90} onChange={(e) => setRound90(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" /> Terminar em ,90</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={includeCompare} onChange={(e) => setIncludeCompare(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" /> Ajustar também o preço “de”</label>
      </div>
      <p className="mt-3 rounded-xl bg-soft px-4 py-2.5 text-sm">
        Exemplo: um produto de <b>{money(100)}</b> vai para <b>{money(Math.max(0.01, exampleFinal))}</b> ({pct > 0 ? "+" : ""}{pct}%) em <b>{catName}</b>.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!confirm ? (
          <button disabled={!pct} onClick={() => setConfirm(true)} className="btn btn-primary">Aplicar reajuste</button>
        ) : (
          <>
            <span className="text-sm font-semibold">Confirma {pct > 0 ? "aumentar" : "diminuir"} {Math.abs(pct)}% em {catName}? Não dá para desfazer automaticamente.</span>
            <button onClick={run} disabled={pending} className="btn btn-primary">{pending ? "Aplicando..." : "Sim, aplicar"}</button>
            <button onClick={() => setConfirm(false)} className="btn btn-ghost">Cancelar</button>
          </>
        )}
        {msg && <span className={`text-sm font-semibold ${msg.ok ? "text-emerald-700" : "text-accent"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
