"use client";

import { useState } from "react";
import { ProductImage } from "@/components/product-image";

export function Gallery({ name, main, images }: { name: string; main: string | null; images: string[] }) {
  const all = [...new Set([main, ...images].filter(Boolean) as string[])];
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const cur = all[i] ?? null;

  return (
    <div className="sticky top-36 animate-fade">
      <div
        className="relative aspect-square overflow-hidden rounded-[calc(var(--radius)*1.4)] border border-line bg-white p-4"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <div className="h-full w-full transition-transform duration-200" style={zoom && cur ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}>
          <ProductImage src={cur} name={name} />
        </div>
      </div>
      {all.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {all.map((src, k) => (
            <button key={src} onClick={() => setI(k)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-1 transition ${k === i ? "border-brand" : "border-line hover:border-brand/50"}`} aria-label={`Foto ${k + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
