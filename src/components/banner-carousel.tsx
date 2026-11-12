"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Banner } from "@/lib/settings-types";
import { IconChevron } from "./icons";
import { useSettings } from "./settings-context";

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const { settings: s } = useSettings();
  const list = banners.filter((b) => b.active && b.image);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = list.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => go(1), 5500);
    return () => clearInterval(t);
  }, [n, paused, go]);

  if (!n) return <FallbackBanner name={s.brand.name} pix={s.commerce.pixDiscountPercent} parcelas={s.commerce.cardEnabled ? s.commerce.maxInstallments : 0} />;

  return (
    <div
      className="group relative overflow-hidden rounded-[calc(var(--radius)*1.6)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)]" style={{ transform: `translateX(-${i * 100}%)` }}>
        {list.map((b, k) => {
          const img = (
            <picture className="block w-full shrink-0">
              {b.imageMobile && <source media="(max-width: 767px)" srcSet={b.imageMobile} />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image} alt={b.alt || s.brand.name} className="block aspect-[16/9] w-full object-cover md:aspect-[1920/820]" loading={k === 0 ? "eager" : "lazy"} />
            </picture>
          );
          return (
            <div key={k} className="w-full shrink-0">
              {b.href ? <Link href={b.href}>{img}</Link> : img}
            </div>
          );
        })}
      </div>
      {n > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Anterior" className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white md:opacity-0 md:group-hover:opacity-100">
            <IconChevron width={18} height={18} className="rotate-180" />
          </button>
          <button onClick={() => go(1)} aria-label="Próximo" className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white md:opacity-0 md:group-hover:opacity-100">
            <IconChevron width={18} height={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {list.map((_, k) => (
              <button key={k} onClick={() => setI(k)} aria-label={`Banner ${k + 1}`} className={`h-1.5 rounded-full transition-all duration-500 ${k === i ? "w-6 bg-white" : "w-1.5 bg-white/55"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Banner desenhado com as cores da loja, usado até você subir os seus no painel. */
function FallbackBanner({ name, pix, parcelas }: { name: string; pix: number; parcelas: number }) {
  return (
    <div className="relative overflow-hidden rounded-[calc(var(--radius)*1.6)] bg-gradient-to-br from-brand-dark via-brand to-brand-dark px-6 py-12 text-white md:px-14 md:py-20">
      <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
      <svg className="absolute right-10 top-8 hidden h-28 w-28 text-white/15 md:block" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z" /></svg>
      <svg className="absolute bottom-10 right-1/3 hidden h-14 w-14 text-white/10 md:block" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z" /></svg>
      <div className="relative max-w-xl stagger">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">{name}</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">Seu autocuidado começa aqui</h1>
        <p className="mt-4 text-base text-white/85 md:text-lg">{pix}% de desconto no Pix{parcelas ? ` e parcelamento em até ${parcelas}x sem juros` : " com aprovação na hora"}.</p>
        <Link href="/ofertas" className="btn mt-7 bg-white text-brand hover:shadow-lg">Ver ofertas</Link>
      </div>
    </div>
  );
}
