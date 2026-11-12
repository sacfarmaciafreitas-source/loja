"use client";

import Link from "next/link";
import { IconLock, IconMail, IconPhone, IconShield } from "./icons";
import { Logo } from "./logo";
import { useSettings } from "./settings-context";

export const institutionalLinks = [
  ["Quem somos", "/quem-somos"],
  ["Política de Privacidade", "/politica-de-privacidade"],
  ["Termos de Uso", "/termos-de-uso"],
  ["Entrega e Frete", "/entrega-e-frete"],
  ["Trocas e Devoluções", "/trocas-e-devolucoes"],
  ["Formas de Pagamento", "/formas-de-pagamento"],
  ["Cookies e Segurança", "/politica-de-cookies"],
  ["Central de Atendimento", "/contato"],
] as const;

const FLAG_LABEL: Record<string, string> = {
  visa: "VISA", mastercard: "Master", elo: "elo", amex: "AMEX", hipercard: "Hiper", diners: "Diners", pix: "Pix", boleto: "Boleto",
};

export function Footer() {
  const { settings: s } = useSettings();
  const c = s.company;
  return (
    <footer className="border-t border-line bg-foot">
      <div className="container-store grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.1fr_1fr]">
        <div>
          <Logo brand={s.brand} height={40} />
          <p className="mt-4 text-[13px] leading-relaxed text-muted">{s.footer.about}</p>
          <p className="mt-4 text-[11.5px] leading-relaxed text-muted">
            {s.brand.name} é a loja online de {c.legalName}.<br />
            Razão social: {c.legalName}<br />
            Nome fantasia: {c.tradeName} · CNPJ: {c.cnpj}<br />
            {c.address}, {c.city}/{c.state} · CEP {c.zip}
          </p>
        </div>

        <div>
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wider">Institucional</p>
          <ul className="space-y-2 text-[13px] text-muted">
            {institutionalLinks.map(([l, h]) => (
              <li key={h}><Link href={h} className="transition hover:text-brand">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wider">Atendimento</p>
          <ul className="space-y-2 text-[13px] text-muted">
            <li className="flex items-center gap-2"><IconMail width={15} height={15} className="text-brand" /> {c.email}</li>
            <li className="flex items-center gap-2"><IconPhone width={15} height={15} className="text-brand" /> {c.phone}</li>
            <li>{c.hours}</li>
          </ul>
          <div className="mt-4 rounded-[var(--radius)] border border-line bg-white p-3.5">
            <p className="flex items-center gap-2 text-[13px] font-bold"><IconShield width={16} height={16} className="text-brand" /> Compra 100% segura</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted">Ambiente protegido com HTTPS/TLS e pagamento processado por instituição autorizada.</p>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wider">Envio e pagamento</p>
          <div className="flex flex-wrap gap-2">
            {s.footer.paymentFlags.filter((f) => s.commerce.cardEnabled || f === "pix").map((f) => (
              <span key={f} className="grid h-7 min-w-11 place-items-center rounded-md border border-line bg-white px-2 text-[10.5px] font-extrabold italic tracking-tight text-ink/80">
                {FLAG_LABEL[f] ?? f}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-muted">Todos os pagamentos são processados em ambiente criptografado, com os dados protegidos de ponta a ponta.</p>
          <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-muted"><IconLock width={14} height={14} className="text-brand" /> Certificado SSL ativo</p>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="container-store py-5 text-center text-[11.5px] leading-relaxed text-muted">
          © {new Date().getFullYear()} {s.brand.name} | Todos os direitos reservados | CNPJ: {c.cnpj} | {c.legalName} | Endereço: {c.address}, {c.city}/{c.state} · CEP {c.zip}
        </p>
      </div>
    </footer>
  );
}
