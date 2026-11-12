"use client";

import { useRef, useState, useTransition } from "react";
import { DynIcon, ICONS, ICON_LABELS, IconDown, IconImage, IconTrash, IconUp } from "@/components/icons";
import { uploadAsset } from "../../upload-action";
import { saveSection } from "./actions";
import type { Field, Section } from "./sections";

type Opt = { value: string; label: string };
type Options = { fonts: Opt[]; categories: Opt[]; providers: Opt[] };
type PageDef = { slug: string; title: string; defaultTitle: string; defaultBody: string };

export function SettingsForm({ section, initial, secretSet, options, pages, site }: {
  section: Section;
  initial: Record<string, unknown>;
  secretSet: Record<string, boolean>;
  options: Options;
  pages: PageDef[];
  site: string;
}) {
  const [values, setValues] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const set = (key: string, v: unknown) => {
    setValues((p) => ({ ...p, [key]: v }));
    setDirty(true);
    setMsg(null);
  };

  const save = () =>
    start(async () => {
      const r = await saveSection(section.slug, values);
      setMsg(r.ok ? { ok: true, text: "Salvo! A loja já está atualizada." } : { ok: false, text: r.error ?? "Erro ao salvar" });
      if (r.ok) setDirty(false);
    });

  return (
    <div className="pb-28">
      <h1 className="text-2xl font-extrabold">{section.title}</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">{section.description.replace("SEU_DOMINIO", site || "seu domínio")}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {section.fields.map((f, i) => (
          <FieldView key={f.key ?? i} f={f} value={f.key ? values[f.key] : undefined} onChange={(v) => f.key && set(f.key, v)} options={options} secretSet={f.key ? secretSet[f.key] : false} pages={pages} site={site} />
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur md:left-[248px]">
        <div className="flex items-center justify-end gap-4 px-5 py-3 md:px-10">
          {msg && <p className={`animate-rise text-sm font-semibold ${msg.ok ? "text-emerald-700" : "text-accent"}`}>{msg.text}</p>}
          {dirty && !msg && <p className="text-sm text-muted">Alterações não salvas</p>}
          <a href="/" target="_blank" className="btn btn-ghost">Ver loja ↗</a>
          <button onClick={save} disabled={pending} className="btn btn-primary min-w-32">{pending ? "Salvando..." : "Salvar"}</button>
        </div>
      </div>
    </div>
  );
}

function Label({ f }: { f: Field }) {
  return (
    <span className="mb-1.5 block">
      <span className="text-[13px] font-bold">{f.label}</span>
      {f.help && <span className="mt-0.5 block text-[12px] text-muted">{f.help}</span>}
    </span>
  );
}

function FieldView({ f, value, onChange, options, secretSet, pages, site }: {
  f: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  options: Options;
  secretSet?: boolean;
  pages: PageDef[];
  site: string;
}) {
  const card = "rounded-2xl border border-line bg-white p-4";
  switch (f.type) {
    case "info":
      return <div className={`${card} md:col-span-2 bg-soft`}><p className="text-[13px] font-bold">{f.label}</p><p className="mt-1 break-all font-mono text-[12.5px]">{f.help.replace("SEU_DOMINIO", site || "https://seudominio.com.br")}</p></div>;
    case "text":
    case "url":
      return <label className={card}><Label f={f} /><input className="input" value={String(value ?? "")} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} /></label>;
    case "secret":
      return (
        <label className={card}>
          <Label f={f} />
          <input type="password" autoComplete="new-password" className="input" value={String(value ?? "")} placeholder={secretSet ? "•••••• salva (deixe em branco para manter)" : "Cole aqui"} onChange={(e) => onChange(e.target.value)} />
        </label>
      );
    case "textarea":
      return <label className={`${card} md:col-span-2`}><Label f={f} /><textarea rows={3} className="input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} /></label>;
    case "html":
      return <label className={`${card} md:col-span-2`}><Label f={f} /><textarea rows={10} className="input font-mono text-[12.5px]" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} /></label>;
    case "number":
      return <label className={card}><Label f={f} /><input type="number" className="input" step={f.step ?? 1} min={f.min} max={f.max} value={Number(value ?? 0)} onChange={(e) => onChange(e.target.value)} /></label>;
    case "color":
      return (
        <label className={card}>
          <Label f={f} />
          <div className="flex items-center gap-2">
            <input type="color" value={String(value || "#000000")} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-white p-1" />
            <input className="input font-mono uppercase" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
          </div>
        </label>
      );
    case "toggle":
      return <div className={card}><Toggle label={f.label} help={f.help} value={Boolean(value)} onChange={onChange} /></div>;
    case "select": {
      const opts = typeof f.options === "string" ? options[f.options] : f.options;
      return (
        <label className={card}>
          <Label f={f} />
          <select className="input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      );
    }
    case "checks": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className={`${card} md:col-span-2`}>
          <Label f={f} />
          <div className="flex flex-wrap gap-2">
            {f.options.map((o) => {
              const on = arr.includes(o.value);
              return (
                <button key={o.value} type="button" onClick={() => onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])} className={`rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition ${on ? "border-brand bg-brand text-brand-ink" : "border-line text-muted hover:border-brand"}`}>
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    case "image":
      return <div className={card}><Label f={f} /><ImageInput value={String(value ?? "")} onChange={onChange} /></div>;
    case "icon":
      return <div className={card}><Label f={f} /><IconPicker value={String(value ?? "")} onChange={onChange} /></div>;
    case "list":
      return <ListEditor f={f} value={Array.isArray(value) ? (value as Record<string, unknown>[]) : []} onChange={onChange} options={options} />;
    case "pages":
      return <PagesEditor value={(value ?? {}) as Record<string, { title: string; body: string }>} onChange={onChange} pages={pages} />;
  }
}

function Toggle({ label, help, value, onChange }: { label: string; help?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex w-full items-center justify-between gap-4 text-left">
      <span>
        <span className="block text-[13px] font-bold">{label}</span>
        {help && <span className="mt-0.5 block text-[12px] text-muted">{help}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${value ? "bg-brand" : "bg-zinc-300"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const pick = async (file: File) => {
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.append("file", file);
    const r = await uploadAsset(fd);
    setBusy(false);
    if (r.url) onChange(r.url);
    else setErr(r.error ?? "Falha no envio");
  };
  return (
    <div>
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) pick(f);
        }}
        className="group relative grid h-32 cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed border-line bg-zinc-50 transition hover:border-brand"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-contain p-2" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-[12px] text-muted"><IconImage /> Clique ou arraste uma imagem</span>
        )}
        {busy && <span className="absolute inset-0 grid place-items-center bg-white/80 text-sm font-bold">Enviando...</span>}
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
      <div className="mt-2 flex gap-2">
        <input className="input !py-2 text-[12px]" placeholder="ou cole a URL da imagem" value={value.startsWith("data:") ? "(imagem enviada)" : value} onChange={(e) => onChange(e.target.value)} />
        {value && <button type="button" onClick={() => onChange("")} className="shrink-0 rounded-lg px-2 text-[12px] font-bold text-accent">Remover</button>}
      </div>
      {err && <p className="mt-1 text-[12px] font-semibold text-accent">{err}</p>}
    </div>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="input flex items-center gap-2 text-left">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-soft text-brand">{value ? <DynIcon name={value} width={16} height={16} /> : "∅"}</span>
        {value ? ICON_LABELS[value] ?? value : "Sem ícone"}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 grid w-full min-w-64 grid-cols-6 gap-1 rounded-xl border border-line bg-white p-2 shadow-xl">
          <button type="button" title="Sem ícone" onClick={() => { onChange(""); setOpen(false); }} className="grid h-10 place-items-center rounded-lg text-muted hover:bg-soft">∅</button>
          {Object.keys(ICONS).map((k) => (
            <button key={k} type="button" title={ICON_LABELS[k]} onClick={() => { onChange(k); setOpen(false); }} className={`grid h-10 place-items-center rounded-lg transition hover:bg-soft hover:text-brand ${k === value ? "bg-brand text-brand-ink" : ""}`}>
              <DynIcon name={k} width={18} height={18} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ListEditor({ f, value, onChange, options }: { f: Extract<Field, { type: "list" }>; value: Record<string, unknown>[]; onChange: (v: unknown) => void; options: Options }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const update = (i: number, k: string, v: unknown) => onChange(value.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpenIdx(openIdx === i ? j : openIdx);
  };
  return (
    <div className="rounded-2xl border border-line bg-white p-4 md:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <Label f={f} />
        <button type="button" onClick={() => { onChange([...value, structuredClone(f.newItem)]); setOpenIdx(value.length); }} className="btn btn-primary !py-2 !text-[13px]">+ Adicionar</button>
      </div>
      <ul className="mt-3 space-y-2">
        {value.map((it, i) => {
          const title = String(it[f.titleKey ?? ""] || `Item ${i + 1}`);
          const img = typeof it.image === "string" ? it.image : "";
          const icon = typeof it.icon === "string" ? it.icon : "";
          return (
            <li key={i} className="overflow-hidden rounded-xl border border-line">
              <div className="flex items-center gap-3 bg-zinc-50 px-3 py-2">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="h-9 w-16 rounded object-cover" />
                ) : icon ? (
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-brand"><DynIcon name={icon} width={16} height={16} /></span>
                ) : null}
                <button type="button" onClick={() => setOpenIdx(openIdx === i ? null : i)} className="flex-1 truncate text-left text-[13.5px] font-semibold">
                  {title} {it.active === false && <span className="ml-1 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-bold">oculto</span>}
                </button>
                <button type="button" onClick={() => move(i, -1)} className="rounded p-1 hover:bg-white" aria-label="Subir"><IconUp width={16} height={16} /></button>
                <button type="button" onClick={() => move(i, 1)} className="rounded p-1 hover:bg-white" aria-label="Descer"><IconDown width={16} height={16} /></button>
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-1 text-accent hover:bg-white" aria-label="Remover"><IconTrash width={16} height={16} /></button>
              </div>
              {openIdx === i && (
                <div className="grid animate-fade gap-3 p-3 md:grid-cols-2">
                  {f.item.map((sub) => (
                    <FieldView key={sub.key} f={sub} value={sub.key ? it[sub.key] : undefined} onChange={(v) => sub.key && update(i, sub.key, v)} options={options} pages={[]} site="" />
                  ))}
                </div>
              )}
            </li>
          );
        })}
        {!value.length && <li className="rounded-xl border border-dashed border-line py-8 text-center text-sm text-muted">Nada aqui ainda. Clique em “+ Adicionar”.</li>}
      </ul>
    </div>
  );
}

function PagesEditor({ value, onChange, pages }: { value: Record<string, { title: string; body: string }>; onChange: (v: unknown) => void; pages: PageDef[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const set = (slug: string, k: "title" | "body", v: string) => onChange({ ...value, [slug]: { title: value[slug]?.title ?? "", body: value[slug]?.body ?? "", [k]: v } });
  return (
    <div className="space-y-2 md:col-span-2">
      {pages.map((p) => {
        const custom = Boolean(value[p.slug]?.body || value[p.slug]?.title);
        return (
          <div key={p.slug} className="overflow-hidden rounded-2xl border border-line bg-white">
            <button type="button" onClick={() => setOpen(open === p.slug ? null : p.slug)} className="flex w-full items-center justify-between px-4 py-3 text-left">
              <span className="font-semibold">{p.title} <span className="ml-1 text-[12px] font-normal text-muted">/{p.slug}</span></span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${custom ? "bg-brand text-brand-ink" : "bg-zinc-100 text-muted"}`}>{custom ? "Personalizada" : "Automática"}</span>
            </button>
            {open === p.slug && (
              <div className="space-y-3 border-t border-line p-4">
                <input className="input" placeholder={p.defaultTitle} value={value[p.slug]?.title ?? ""} onChange={(e) => set(p.slug, "title", e.target.value)} />
                <textarea rows={12} className="input font-mono text-[12.5px]" placeholder="Deixe em branco para usar o texto automático. Aceita HTML simples: <p>, <h2>, <ul><li>, <b>, <a>." value={value[p.slug]?.body ?? ""} onChange={(e) => set(p.slug, "body", e.target.value)} />
                <div className="flex gap-2">
                  <button type="button" onClick={() => onChange({ ...value, [p.slug]: { title: p.defaultTitle, body: p.defaultBody.trim() } })} className="btn btn-ghost !py-2 !text-[13px]">Carregar texto automático para editar</button>
                  {custom && <button type="button" onClick={() => { const n = { ...value }; delete n[p.slug]; onChange(n); }} className="btn !py-2 !text-[13px] text-accent">Voltar ao automático</button>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
