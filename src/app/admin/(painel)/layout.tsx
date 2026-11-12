import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/settings";
import { dbSession } from "@/lib/supabase";
import { AdminNav } from "./admin-nav";

export const dynamic = "force-dynamic";

async function logout() {
  "use server";
  const db = await dbSession();
  await db.auth.signOut();
  redirect("/admin/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, demo } = await requireAdmin();
  const s = await getSettings();
  return (
    <div className="min-h-screen bg-zinc-50 md:grid md:grid-cols-[248px_1fr]">
      <aside className="border-r border-line bg-white md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-sm font-extrabold text-brand-ink">{s.brand.name.slice(0, 1)}</span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-extrabold">{s.brand.name}</p>
            <p className="text-[11px] text-muted">Painel da loja</p>
          </div>
        </div>
        <AdminNav />
        <div className="hidden border-t border-line px-5 py-4 md:block">
          <p className="truncate text-[11px] text-muted">{user.email}</p>
          {!demo && <form action={logout}><button className="mt-1 text-[12px] font-bold text-muted hover:text-accent">Sair</button></form>}
        </div>
      </aside>
      <main className="min-w-0 p-5 md:p-10">
        {demo && <p className="mb-5 rounded-xl bg-amber-100 px-4 py-2.5 text-[13px] font-semibold text-amber-900">Painel em modo demo: as alterações ficam só na memória do servidor.</p>}
        {children}
      </main>
    </div>
  );
}
