import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { POLICY_SLUGS, getPolicy } from "@/lib/policies";
import { getSettings } from "@/lib/settings";

type Props = { params: Promise<{ page: string }> };

export const dynamicParams = false;
export const revalidate = 300;
export function generateStaticParams() {
  return POLICY_SLUGS.map(([page]) => ({ page }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const p = getPolicy(await getSettings(), page);
  return p ? { title: p.title, alternates: { canonical: `/${page}` } } : {};
}

export default async function PolicyPage({ params }: Props) {
  const { page } = await params;
  const s = await getSettings();
  const p = getPolicy(s, page);
  if (!p) notFound();
  const wa = s.company.whatsapp ? `https://wa.me/${s.company.whatsapp.replace(/\D/g, "")}` : "";
  return (
    <article className="container-store max-w-3xl pt-8">
      <h1 className="animate-rise text-3xl font-extrabold tracking-tight">{p.title}</h1>
      <div className="prose-store mt-6 animate-fade rounded-[calc(var(--radius)*1.2)] border border-line bg-white p-6 md:p-9" dangerouslySetInnerHTML={{ __html: p.body }} />
      {page === "contato" && wa && <a href={wa} target="_blank" rel="noopener" className="btn btn-primary mt-6">Chamar no WhatsApp</a>}
    </article>
  );
}
