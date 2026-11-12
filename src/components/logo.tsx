import Link from "next/link";
import type { Settings } from "@/lib/settings-types";

export function Logo({ brand, height }: { brand: Settings["brand"]; height?: number }) {
  const h = height ?? brand.logoHeight ?? 44;
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={brand.name}>
      {brand.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={brand.logoUrl} alt={brand.name} style={{ height: h }} className="w-auto object-contain" />
      ) : (
        <>
          <span className="grid place-items-center rounded-xl bg-brand text-brand-ink" style={{ height: h * 0.82, width: h * 0.82 }}>
            <svg viewBox="0 0 24 24" width={h * 0.45} height={h * 0.45} fill="currentColor"><path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z" /></svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-brand">{brand.name}</span>
        </>
      )}
    </Link>
  );
}
