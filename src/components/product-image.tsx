const tints = ["#EEF4FC", "#FDF1EE", "#EFF7F2", "#F6F2FB", "#FBF7EC", "#EEF7F9"];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Foto do produto ou, sem foto, uma ilustração neutra gerada a partir do nome. */
export function ProductImage({ src, name, className = "" }: { src: string | null; name: string; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} loading="lazy" className={`h-full w-full object-contain ${className}`} />;
  }
  const h = hash(name);
  const shape = h % 3;
  return (
    <div className={`relative grid h-full w-full place-items-center overflow-hidden ${className}`} style={{ background: tints[h % tints.length] }} role="img" aria-label={name}>
      <svg viewBox="0 0 120 160" className="h-3/5 drop-shadow-[0_12px_14px_rgba(0,0,0,0.12)]">
        {shape === 0 && (<><rect x="44" y="10" width="32" height="22" rx="6" fill="var(--brand-dark)" /><rect x="30" y="30" width="60" height="120" rx="18" fill="white" /><rect x="38" y="70" width="44" height="34" rx="6" fill="var(--brand)" /></>)}
        {shape === 1 && (<><rect x="34" y="8" width="52" height="26" rx="8" fill="var(--brand)" /><path d="M28 40h64v100a12 12 0 0 1-12 12H40a12 12 0 0 1-12-12V40Z" fill="white" /><rect x="40" y="76" width="40" height="6" rx="3" fill="var(--brand-dark)" opacity="0.35" /><rect x="40" y="88" width="28" height="6" rx="3" fill="var(--brand-dark)" opacity="0.2" /></>)}
        {shape === 2 && (<><path d="M52 6h16v24l14 14v100a10 10 0 0 1-10 10H48a10 10 0 0 1-10-10V44l14-14V6Z" fill="white" /><rect x="50" y="0" width="20" height="10" rx="3" fill="var(--accent)" /><circle cx="60" cy="98" r="16" fill="var(--brand)" /></>)}
      </svg>
    </div>
  );
}
