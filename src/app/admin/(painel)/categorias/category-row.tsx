"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { IconDown, IconTrash, IconUp } from "@/components/icons";
import { deleteCategory, moveCategory, updateCategory } from "./actions";

type Cat = { id: string; slug: string; name: string; blurb: string | null; image_url: string | null };

export function CategoryRow({ cat, count, first, last }: { cat: Cat; count: number; first: boolean; last: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [f, setF] = useState({ name: cat.name, slug: cat.slug, blurb: cat.blurb ?? "", image_url: cat.image_url ?? "" });
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  return (
    <li className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => setOpen((v) => !v)} className="flex-1 text-left">
          <span className="font-semibold">{cat.name}</span>
          <span className="ml-2 text-[12px] text-muted">/c/{cat.slug} · {count} produtos</span>
        </button>
        <button disabled={first || pending} onClick={() => run(() => moveCategory(cat.id, -1))} className="rounded p-1.5 hover:bg-zinc-100 disabled:opacity-30" aria-label="Subir"><IconUp width={16} height={16} /></button>
        <button disabled={last || pending} onClick={() => run(() => moveCategory(cat.id, 1))} className="rounded p-1.5 hover:bg-zinc-100 disabled:opacity-30" aria-label="Descer"><IconDown width={16} height={16} /></button>
        {confirm ? (
          <span className="flex items-center gap-2 text-[12px]">
            Excluir?
            <button onClick={() => run(() => deleteCategory(cat.id))} className="font-bold text-accent">Sim</button>
            <button onClick={() => setConfirm(false)} className="font-bold text-muted">Não</button>
          </span>
        ) : (
          <button onClick={() => setConfirm(true)} className="rounded p-1.5 text-accent hover:bg-zinc-100" aria-label="Excluir"><IconTrash width={16} height={16} /></button>
        )}
      </div>
      {open && (
        <div className="grid animate-fade gap-3 border-t border-line p-4 md:grid-cols-2">
          <input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Nome" />
          <input className="input" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="URL" />
          <input className="input md:col-span-2" value={f.blurb} onChange={(e) => setF({ ...f, blurb: e.target.value })} placeholder="Descrição curta" />
          <div className="flex items-center gap-3 md:col-span-2">
            <button disabled={pending} onClick={() => start(async () => { const r = await updateCategory(cat.id, f); setMsg("error" in r && r.error ? r.error : "Salvo"); router.refresh(); })} className="btn btn-primary">Salvar</button>
            {msg && <span className="text-sm font-semibold text-muted">{msg}</span>}
          </div>
        </div>
      )}
    </li>
  );
}
