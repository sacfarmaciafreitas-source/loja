import { requireAdmin } from "@/lib/admin";
import { DemoOnly } from "../demo-only";

export default async function NewsletterAdmin() {
  const { db, demo } = await requireAdmin();
  if (demo) return <DemoOnly />;
  const { data } = await db.from("newsletter_subscribers").select("email,created_at").order("created_at", { ascending: false }).limit(5000);
  const list = data ?? [];
  const csv = "data:text/csv;charset=utf-8," + encodeURIComponent("email,data\n" + list.map((s) => `${s.email},${s.created_at}`).join("\n"));
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Newsletter</h1>
          <p className="mt-1 text-sm text-muted">{list.length} inscritos</p>
        </div>
        {list.length > 0 && <a href={csv} download="newsletter.csv" className="btn btn-primary">Baixar CSV</a>}
      </div>
      <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">
        {list.map((s) => (
          <li key={s.email} className="flex justify-between px-5 py-3 text-sm"><span>{s.email}</span><span className="text-muted">{new Date(s.created_at).toLocaleDateString("pt-BR")}</span></li>
        ))}
        {!list.length && <li className="px-5 py-10 text-center text-sm text-muted">Ninguém inscrito ainda.</li>}
      </ul>
    </>
  );
}
