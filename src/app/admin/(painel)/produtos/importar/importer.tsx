"use client";

import { useState } from "react";
import { importProducts, type ImportRow } from "./actions";

const COLUMNS = ["nome", "preco", "preco_de", "estoque", "marca", "categoria", "sku", "gtin", "descricao", "imagem_url", "destaque", "ativo", "slug"];
const EXAMPLE = `nome;preco;preco_de;estoque;marca;categoria;sku;gtin;descricao;imagem_url;destaque;ativo
Protetor Solar FPS 50 50g;59,90;79,90;30;Marca X;Dermocosméticos;PS50;7891234567890;Proteção diária com toque seco;https://exemplo.com/foto.jpg;sim;sim`;

const norm = (h: string) => h.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
const ALIASES: Record<string, string> = { name: "nome", titulo: "nome", price: "preco", preco_por: "preco", valor: "preco", compare_at_price: "preco_de", preco_antigo: "preco_de", stock: "estoque", quantidade: "estoque", brand: "marca", category: "categoria", ean: "gtin", codigo_de_barras: "gtin", description: "descricao", imagem: "imagem_url", image: "imagem_url", foto: "imagem_url", featured: "destaque", active: "ativo" };

/** Lê CSV com ; ou , e aspas. */
function parseCsv(text: string): string[][] {
  const first = text.split(/\r?\n/)[0] ?? "";
  const sep = (first.match(/;/g)?.length ?? 0) >= (first.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

export function Importer() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ ok: number; errors: string[] } | null>(null);

  const load = (text: string) => {
    const grid = parseCsv(text.replace(/^﻿/, ""));
    if (grid.length < 2) return setRows([]);
    const head = grid[0].map((h) => ALIASES[norm(h)] ?? norm(h));
    setRows(grid.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()]))));
    setResult(null);
  };

  const run = async () => {
    setBusy(true);
    let ok = 0;
    const errors: string[] = [];
    const size = 200;
    for (let i = 0; i < rows.length; i += size) {
      const r = await importProducts(rows.slice(i, i + size));
      ok += r.ok;
      errors.push(...r.errors.map((e) => e.replace(/Linha (\d+)/, (_, n) => `Linha ${Number(n) + i + 1}`)));
      setProgress(Math.min(100, Math.round(((i + size) / rows.length) * 100)));
    }
    setResult({ ok, errors });
    setBusy(false);
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-line bg-white p-8 text-center transition hover:border-brand">
          <input type="file" accept=".csv,text/csv" hidden onChange={async (e) => e.target.files?.[0] && load(await e.target.files[0].text())} />
          <span className="font-bold">Escolher arquivo CSV</span>
          <span className="mt-1 text-[12px] text-muted">Separado por ponto e vírgula ou vírgula</span>
        </label>
        <div className="rounded-2xl border border-line bg-white p-4 text-[12.5px]">
          <p className="font-bold">Colunas aceitas</p>
          <p className="mt-1 text-muted">{COLUMNS.join(", ")}</p>
          <p className="mt-2 text-muted">Obrigatórias: <b>nome</b> e <b>preco</b>. Em destaque/ativo use sim ou não.</p>
          <a href={`data:text/csv;charset=utf-8,${encodeURIComponent("﻿" + EXAMPLE)}`} download="modelo-produtos.csv" className="mt-3 inline-block font-bold text-brand underline">Baixar planilha modelo</a>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="rounded-2xl border border-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <p className="font-bold">{rows.length} produtos encontrados</p>
            <button onClick={run} disabled={busy} className="btn btn-primary">{busy ? `Importando ${progress}%` : "Importar agora"}</button>
          </div>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-[12.5px]">
              <thead className="sticky top-0 bg-zinc-50 text-left text-muted"><tr>{["nome", "preco", "preco_de", "estoque", "categoria", "marca"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">
                {rows.slice(0, 100).map((r, i) => (
                  <tr key={i}>{["nome", "preco", "preco_de", "estoque", "categoria", "marca"].map((h) => <td key={h} className="max-w-xs truncate px-3 py-2">{r[h]}</td>)}</tr>
                ))}
              </tbody>
            </table>
            {rows.length > 100 && <p className="px-4 py-2 text-[12px] text-muted">Mostrando 100 de {rows.length}.</p>}
          </div>
        </div>
      )}

      {result && (
        <div className={`rounded-2xl p-4 text-sm ${result.errors.length ? "bg-amber-50" : "bg-emerald-50"}`}>
          <p className="font-bold">{result.ok} produtos importados.</p>
          {result.errors.slice(0, 20).map((e, i) => <p key={i} className="mt-1 text-accent">{e}</p>)}
        </div>
      )}
    </div>
  );
}
