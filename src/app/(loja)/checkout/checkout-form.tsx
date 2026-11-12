"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCart } from "@/components/cart";
import { IconPix, IconShield } from "@/components/icons";
import { ProductImage } from "@/components/product-image";
import { money, onlyDigits, pixPrice, shippingFor } from "@/lib/format";
import { placeOrder } from "./actions";
import { useSettings } from "@/components/settings-context";
import { trackEvent } from "@/components/tracking";

const mask = {
  cpf: (v: string) => onlyDigits(v).slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"),
  phone: (v: string) => onlyDigits(v).slice(0, 11).replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2"),
  cep: (v: string) => onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2"),
};

export function CheckoutForm() {
  const { items, subtotal, clear } = useCart();
  const { settings } = useSettings();
  const c = settings.commerce;
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [f, setF] = useState({ name: "", email: "", phone: "", document: "", cep: "", street: "", number: "", complement: "", district: "", city: "", state: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (k === "document") v = mask.cpf(v);
    if (k === "phone") v = mask.phone(v);
    if (k === "cep") v = mask.cep(v);
    setF((p) => ({ ...p, [k]: v }));
    if (k === "cep" && onlyDigits(v).length === 8) lookupCep(onlyDigits(v));
  };

  async function lookupCep(cep: string) {
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (!d.erro) setF((p) => ({ ...p, street: d.logradouro || p.street, district: d.bairro || p.district, city: d.localidade || p.city, state: d.uf || p.state }));
    } catch {}
  }

  const shipping = shippingFor(subtotal, c);
  const total = pixPrice(subtotal, c) + shipping;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    trackEvent("begin_checkout", { value: total, items: items.map((i) => ({ id: i.productId, name: i.name, price: i.price, qty: i.qty })) }, settings.tracking);
    start(async () => {
      const res = await placeOrder({
        name: f.name,
        email: f.email,
        phone: f.phone,
        document: f.document,
        address: { cep: f.cep, street: f.street, number: f.number, complement: f.complement, district: f.district, city: f.city, state: f.state },
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
      });
      if (res.error || !res.id) return setError(res.error ?? "Erro ao criar pedido");
      clear();
      router.push(`/pedido/${res.id}`);
    });
  };

  if (!items.length) {
    return (
      <div className="mt-16 text-center">
        <p className="text-muted">Seu carrinho está vazio.</p>
        <Link href="/" className="btn btn-primary mt-6">Ver produtos</Link>
      </div>
    );
  }

  const Field = ({ k, label, className = "", ...rest }: { k: keyof typeof f; label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      <input className="input" value={f[k]} onChange={set(k)} {...rest} />
    </label>
  );

  return (
    <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="stagger space-y-6">
        <section className="rounded-3xl bg-white p-6 ring-1 ring-line">
          <h2 className="mb-4 flex items-center gap-3 font-bold"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs text-brand-ink">1</span> Seus dados</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {Field({ k: "name", label: "Nome completo", className: "sm:col-span-2", required: true, autoComplete: "name" })}
            {Field({ k: "email", label: "E-mail", type: "email", required: true, autoComplete: "email" })}
            {Field({ k: "phone", label: "Celular", required: true, inputMode: "numeric", autoComplete: "tel", placeholder: "(00) 00000-0000" })}
            {Field({ k: "document", label: "CPF", required: true, inputMode: "numeric", placeholder: "000.000.000-00" })}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 ring-1 ring-line">
          <h2 className="mb-4 flex items-center gap-3 font-bold"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs text-brand-ink">2</span> Entrega</h2>
          <div className="grid gap-4 sm:grid-cols-6">
            {Field({ k: "cep", label: "CEP", className: "sm:col-span-2", required: true, inputMode: "numeric", autoComplete: "postal-code" })}
            {Field({ k: "street", label: "Rua", className: "sm:col-span-4", required: true })}
            {Field({ k: "number", label: "Número", className: "sm:col-span-2", required: true })}
            {Field({ k: "complement", label: "Complemento", className: "sm:col-span-4" })}
            {Field({ k: "district", label: "Bairro", className: "sm:col-span-2", required: true })}
            {Field({ k: "city", label: "Cidade", className: "sm:col-span-3", required: true })}
            {Field({ k: "state", label: "UF", className: "sm:col-span-1", required: true, maxLength: 2 })}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 ring-1 ring-line">
          <h2 className="mb-4 flex items-center gap-3 font-bold"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs text-brand-ink">3</span> Pagamento</h2>
          <div className="flex items-center gap-4 rounded-2xl border-2 border-brand bg-brand-soft p-4">
            <IconPix className="text-brand" />
            <div>
              <p className="font-bold">Pix</p>
              <p className="text-sm text-muted">Aprovação imediata, com desconto aplicado</p>
            </div>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl bg-white p-6 ring-1 ring-line">
          <h2 className="font-bold">Resumo</h2>
          <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl"><ProductImage src={i.image_url} name={i.name} /></div>
                <p className="line-clamp-2 flex-1 text-sm">{i.qty}x {i.name}</p>
                <p className="text-sm font-bold">{money(i.price * i.qty)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Desconto Pix</span><span className="text-brand">−{money(subtotal - pixPrice(subtotal, c))}</span></div>
            <div className="flex justify-between"><span className="text-muted">Frete</span><span>{shipping ? money(shipping) : "Grátis"}</span></div>
            <div className="flex justify-between border-t border-line pt-3 text-lg font-extrabold"><span>Total</span><span>{money(total)}</span></div>
          </div>
          {error && <p className="mt-4 animate-rise rounded-xl bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">{error}</p>}
          <button disabled={pending} className="btn btn-primary mt-5 w-full py-4 text-base">
            {pending ? "Gerando Pix..." : "Gerar Pix e finalizar"}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted"><IconShield width={14} /> Pagamento processado em ambiente seguro</p>
        </div>
      </aside>
    </form>
  );
}
