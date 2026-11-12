"use client";

import { useMemo, useRef, useState } from "react";
import { importBatch, importCategories, scanStore, type BatchOptions, type ScanResult } from "./actions";

type Cat = NonNullable<ScanResult["categories"]>[number];
const BATCH = 8;
const SAVE_KEY = "import:progress";

const sensitive = /f[oó]rmula|leite infantil|leites infantis|leite.*(0 a|1 a 3)/i;

export function StoreImporter() {
  const [url, setUrl] = useState("https://drogariacarvalho.com");
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [opts, setOpts] = useState({ imagesPerProduct: 1, stock: 100, pricePct: 0, round90: false, hidden: false, skipExistingImages: true });
  const [run, setRun] = useState<{ state: "idle" | "running" | "paused" | "done"; done: number; total: number; images: number; failed: number; log: string[] }>({ state: "idle", done: 0, total: 0, images: 0, failed: 0, log: [] });
  const stopRef = useRef(false);

  const cats = scan?.categories ?? [];
  const children = useMemo(() => {
    const m = new Map<string | null, Cat[]>();
    cats.forEach((c) => m.set(c.parent, [...(m.get(c.parent) ?? []), c]));
    return m;
  }, [cats]);
  const descendants = (k: string): string[] => [k, ...(children.get(k) ?? []).flatMap((c) => descendants(c.key))];
  const selectedProducts = cats.filter((c) => sel.has(c.key)).reduce((a, c) => a + (c.count - (children.get(c.key) ?? []).reduce((s, k) => s + k.count, 0)), 0);

  const doScan = async () => {
    setScanning(true);
    setScan(null);
    const r = await scanStore(url);
    setScanning(false);
    setScan(r);
    if (!r.ok) return;
    setSel(new Set((r.categories ?? []).filter((c) => !sensitive.test(c.name)).map((c) => c.key)));
    // importação interrompida antes? oferece continuar de onde parou
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      if (saved?.keys?.length && saved.offset > 0) {
        setSel(new Set(saved.keys));
        setRun({ state: "paused", done: saved.offset, total: 0, images: 0, failed: 0, log: [`Importação anterior parou no produto ${saved.offset}. Clique em Continuar.`] });
      }
    } catch {}
  };

  const toggle = (k: string) => {
    const keys = descendants(k);
    setSel((prev) => {
      const n = new Set(prev);
      const on = !prev.has(k);
      keys.forEach((x) => (on ? n.add(x) : n.delete(x)));
      return n;
    });
  };

  const start = async (resume = false) => {
    stopRef.current = false;
    const keys = [...sel];
    const options: BatchOptions = { keys, ...opts };
    let offset = 0;
    if (resume) {
      try {
        offset = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}").offset ?? 0;
      } catch {}
    }
    setRun((r) => ({ ...r, state: "running", log: resume ? r.log : ["Criando categorias..."], done: offset }));
    if (!resume) {
      const c = await importCategories(keys);
      if (!c.ok) return setRun((r) => ({ ...r, state: "paused", log: [...r.log, `Erro: ${c.error}`] }));
      setRun((r) => ({ ...r, log: [...r.log, `${c.created} categorias prontas. Importando produtos...`] }));
    }
    let retries = 0;
    for (;;) {
      if (stopRef.current) {
        setRun((r) => ({ ...r, state: "paused", log: [...r.log, "Pausado. Clique em Continuar para seguir de onde parou."] }));
        return;
      }
      const b = await importBatch(offset, BATCH, options).catch((e) => ({ ok: false, processed: 0, total: 0, images: 0, failedImages: 0, errors: [String(e)] }));
      if (!b.ok && retries < 3) {
        retries++;
        setRun((r) => ({ ...r, log: [...r.log.slice(-30), `Lote ${offset} falhou (${b.errors[0] ?? "erro"}), tentando de novo...`] }));
        await new Promise((res) => setTimeout(res, 2000 * retries));
        continue;
      }
      retries = 0;
      offset += b.processed || BATCH;
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ offset, keys }));
      } catch {}
      setRun((r) => ({ ...r, done: Math.min(offset, b.total || r.total), total: b.total || r.total, images: r.images + b.images, failed: r.failed + b.failedImages, log: b.errors.length ? [...r.log.slice(-30), ...b.errors] : r.log }));
      if (!b.processed || offset >= b.total) break;
    }
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {}
    setRun((r) => ({ ...r, state: "done", log: [...r.log, "Importação concluída!"] }));
  };

  const pct = run.total ? Math.round((run.done / run.total) * 100) : 0;
  const tops = children.get(null) ?? [];

  const Node = ({ c, depth }: { c: Cat; depth: number }) => {
    const kids = children.get(c.key) ?? [];
    const isOpen = open.has(c.key);
    return (
      <li>
        <div className="flex items-center gap-2 rounded-lg py-1.5 pr-2 hover:bg-zinc-50" style={{ paddingLeft: depth * 18 + 6 }}>
          {kids.length ? (
            <button onClick={() => setOpen((s) => { const n = new Set(s); if (n.has(c.key)) n.delete(c.key); else n.add(c.key); return n; })} className="w-4 text-muted">{isOpen ? "▾" : "▸"}</button>
          ) : <span className="w-4" />}
          <input type="checkbox" checked={sel.has(c.key)} onChange={() => toggle(c.key)} className="h-4 w-4 accent-[var(--brand)]" />
          <span className={`flex-1 text-[13.5px] ${depth === 0 ? "font-bold" : ""}`}>{c.name}</span>
          {sensitive.test(c.name) && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10.5px] font-bold text-amber-800">atenção</span>}
          <span className="text-[12px] text-muted">{c.count}</span>
        </div>
        {kids.length > 0 && isOpen && <ul>{kids.map((k) => <Node key={k.key} c={k} depth={depth + 1} />)}</ul>}
      </li>
    );
  };

  const busy = run.state === "running";

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-white p-4">
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="input flex-1" placeholder="https://loja.com.br" disabled={busy} />
        <button onClick={doScan} disabled={scanning || busy} className="btn btn-primary">{scanning ? "Analisando..." : "Analisar loja"}</button>
      </div>
      {scan && !scan.ok && <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">{scan.error}</p>}

      {scan?.ok && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[["Produtos encontrados", scan.total], ["Com foto", scan.withImages], ["Categorias", scan.categories?.length]].map(([l, v]) => (
              <div key={String(l)} className="rounded-2xl border border-line bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{l}</p>
                <p className="mt-1 text-2xl font-extrabold">{v}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-bold">Escolha as categorias</p>
                <div className="flex gap-3 text-[12.5px] font-semibold">
                  <button onClick={() => setSel(new Set(cats.map((c) => c.key)))} className="text-brand">Marcar todas</button>
                  <button onClick={() => setSel(new Set())} className="text-muted">Limpar</button>
                </div>
              </div>
              <ul className="max-h-[480px] overflow-y-auto">{tops.map((c) => <Node key={c.key} c={c} depth={0} />)}</ul>
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
                Marcadas como “atenção”: fórmulas e leites infantis. A Lei 11.265 restringe promoção e desconto desses itens, então vieram desmarcadas.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-line bg-white p-4 text-sm">
              <p className="font-bold">Opções</p>
              <label className="block"><span className="mb-1 block text-[12.5px] font-bold text-muted">Fotos por produto</span>
                <select className="input" value={opts.imagesPerProduct} onChange={(e) => setOpts({ ...opts, imagesPerProduct: Number(e.target.value) })}>
                  <option value={1}>Só a principal (cabe no plano grátis do Supabase)</option>
                  <option value={3}>Até 3 fotos</option>
                  <option value={0}>Todas as fotos (precisa do plano pago do Supabase)</option>
                </select>
              </label>
              <label className="block"><span className="mb-1 block text-[12.5px] font-bold text-muted">Estoque inicial</span>
                <input type="number" className="input" value={opts.stock} onChange={(e) => setOpts({ ...opts, stock: Number(e.target.value) })} />
              </label>
              <label className="block"><span className="mb-1 block text-[12.5px] font-bold text-muted">Ajuste de preço na importação (%)</span>
                <input type="number" className="input" value={opts.pricePct} onChange={(e) => setOpts({ ...opts, pricePct: Number(e.target.value) })} />
                <span className="mt-1 block text-[11.5px] text-muted">Ex.: 10 = 10% mais caro, -5 = 5% mais barato. Também dá para ajustar depois na tela de produtos.</span>
              </label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={opts.round90} onChange={(e) => setOpts({ ...opts, round90: e.target.checked })} className="h-4 w-4 accent-[var(--brand)]" /> Terminar preços em ,90</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={opts.hidden} onChange={(e) => setOpts({ ...opts, hidden: e.target.checked })} className="h-4 w-4 accent-[var(--brand)]" /> Importar ocultos (revisar antes de publicar)</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={opts.skipExistingImages} onChange={(e) => setOpts({ ...opts, skipExistingImages: e.target.checked })} className="h-4 w-4 accent-[var(--brand)]" /> Não baixar de novo fotos já importadas</label>

              <div className="border-t border-line pt-3">
                <p className="text-[13px]"><b>{selectedProducts}</b> produtos selecionados</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {run.state !== "running" && <button onClick={() => start(false)} disabled={!selectedProducts} className="btn btn-primary">Importar agora</button>}
                  {run.state === "paused" && <button onClick={() => start(true)} className="btn btn-ghost">Continuar</button>}
                  {run.state === "running" && <button onClick={() => (stopRef.current = true)} className="btn btn-ghost">Pausar</button>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {run.state !== "idle" && (
        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <p className="font-bold">{run.state === "done" ? "Concluído" : run.state === "paused" ? "Pausado" : "Importando..."}</p>
            <p className="text-muted">{run.done} de {run.total || "?"} produtos · {run.images} fotos salvas{run.failed ? ` · ${run.failed} fotos falharam` : ""}</p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-[12px] text-muted">Deixe esta aba aberta enquanto importa. Se fechar, volte aqui, analise de novo e clique em Continuar.</p>
          <ul className="mt-3 max-h-40 space-y-0.5 overflow-y-auto font-mono text-[11.5px] text-muted">{run.log.map((l, i) => <li key={i}>{l}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
