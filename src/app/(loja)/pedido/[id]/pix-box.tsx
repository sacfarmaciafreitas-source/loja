"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { money } from "@/lib/format";
import { simulatePayment } from "./actions";

export function PixBox({ orderId, code, qr, total, mock }: { orderId: string; code: string; qr: string; total: number; mock: boolean }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  // Confere o status a cada 5s até o webhook confirmar o pagamento
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(t);
  }, [router]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="mt-8 animate-rise rounded-[2rem] bg-white p-6 text-center ring-1 ring-line md:p-10">
      <p className="text-sm text-muted">Valor a pagar</p>
      <p className="text-4xl font-extrabold tracking-tight text-brand">{money(Number(total))}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qr} alt="QR Code Pix" className="mx-auto mt-6 w-56 rounded-2xl ring-1 ring-line md:w-64" />
      <p className="mt-5 text-sm text-muted">Abra o app do seu banco, escolha Pix e escaneie o código. Ou copie o código abaixo:</p>
      <div className="mx-auto mt-3 max-w-lg break-all rounded-2xl bg-surface p-4 font-mono text-xs">{code}</div>
      <button onClick={copy} className="btn btn-primary mt-4 w-full max-w-lg">{copied ? "Código copiado!" : "Copiar código Pix"}</button>
      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
        <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-brand opacity-60" /><span className="h-2 w-2 rounded-full bg-brand" /></span>
        Aguardando confirmação do pagamento
      </p>
      {mock && (
        <button
          onClick={() => start(async () => { await simulatePayment(orderId); router.refresh(); })}
          disabled={pending}
          className="mt-6 rounded-full border border-dashed border-accent px-4 py-2 text-xs font-bold text-accent"
        >
          {pending ? "Simulando..." : "Modo teste: simular pagamento"}
        </button>
      )}
    </div>
  );
}
