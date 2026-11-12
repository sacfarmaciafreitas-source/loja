"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/app/(loja)/newsletter-action";
import { DynIcon, IconChat, IconHeadset, IconMail } from "./icons";
import { useSettings } from "./settings-context";

export function Shortcuts() {
  const { settings: s } = useSettings();
  if (!s.shortcuts.length) return null;
  return (
    <section className="container-store mt-6">
      <div className="no-scrollbar stagger flex justify-between gap-3 overflow-x-auto pb-1">
        {s.shortcuts.map((it, i) => (
          <Link key={i} href={it.href} className="group flex w-[84px] shrink-0 flex-col items-center gap-2 text-center md:w-[104px]">
            <span className="grid h-14 w-14 place-items-center rounded-[calc(var(--radius)*1.1)] bg-soft text-brand transition duration-300 group-hover:-translate-y-1 group-hover:bg-brand group-hover:text-brand-ink md:h-[60px] md:w-[60px]">
              <DynIcon name={it.icon} width={24} height={24} />
            </span>
            <span className="text-[12px] font-medium leading-tight text-ink">{it.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function Benefits() {
  const { settings: s } = useSettings();
  if (!s.benefits.length) return null;
  return (
    <section className="container-store mt-8">
      <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {s.benefits.map((b, i) => (
          <div key={i} className="flex items-center gap-3 rounded-[var(--radius)] border border-line bg-white px-4 py-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soft text-brand"><DynIcon name={b.icon} width={18} height={18} /></span>
            <div>
              <p className="text-[13.5px] font-bold">{b.title}</p>
              <p className="text-[12px] text-muted">{b.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SupportBlock() {
  const { settings: s } = useSettings();
  if (!s.support.enabled) return null;
  const c = s.company;
  return (
    <section className="container-store mt-16">
      <div className="relative flex flex-col gap-5 overflow-hidden rounded-[calc(var(--radius)*1.4)] bg-brand-dark px-6 py-7 text-white md:flex-row md:items-center md:px-8">
        <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-white/5" />
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10"><IconHeadset /></span>
        <div className="flex-1">
          <h2 className="text-xl font-extrabold">{s.support.title}</h2>
          <p className="mt-1 text-[13.5px] text-white/80">{s.support.text}</p>
          <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-white/90">
            {c.whatsapp && <span className="flex items-center gap-1.5"><IconChat width={15} height={15} /> WhatsApp: {c.phone}</span>}
            {c.email && <span className="flex items-center gap-1.5"><IconMail width={15} height={15} /> E-mail: {c.email}</span>}
          </div>
        </div>
        <Link href="/contato" className="btn relative bg-white text-brand-dark hover:shadow-lg">{s.support.buttonLabel}</Link>
      </div>
    </section>
  );
}

export function Newsletter() {
  const { settings: s } = useSettings();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  if (!s.newsletter.enabled) return null;
  return (
    <section className="mt-16 border-t border-line bg-white">
      <div className="container-store flex flex-col gap-5 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-extrabold">{s.newsletter.title}</h2>
          <p className="mt-1 text-[13.5px] text-muted">{s.newsletter.text}</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await subscribeNewsletter(email);
              setMsg(r.message);
              if (r.ok) setEmail("");
            });
          }}
          className="w-full md:max-w-md"
        >
          <div className="flex gap-2">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu e-mail" className="input !rounded-full" />
            <button disabled={pending} className="btn btn-primary shrink-0">{pending ? "Enviando..." : "Quero receber"}</button>
          </div>
          <p className="mt-2 text-[11.5px] text-muted">
            {msg || <>Ao cadastrar seu e-mail, você concorda com nossa <Link href="/politica-de-privacidade" className="underline">Política de Privacidade</Link>.</>}
          </p>
        </form>
      </div>
    </section>
  );
}
