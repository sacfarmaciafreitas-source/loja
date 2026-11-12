import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { dbSession, isDemo } from "@/lib/supabase";

async function login(formData: FormData) {
  "use server";
  const db = await dbSession();
  const { error } = await db.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  redirect(error ? "/admin/login?erro=credenciais" : "/admin");
}

const msgs: Record<string, string> = {
  credenciais: "E-mail ou senha incorretos.",
  "sem-permissao": "Seu usuário ainda não é administrador. Rode o comando de admin no Supabase.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ erro?: string; demo?: string }> }) {
  const { erro, demo } = await searchParams;
  const s = await getSettings();
  return (
    <div className="grid min-h-screen place-items-center bg-brand p-4">
      <div className="w-full max-w-sm animate-rise rounded-[2rem] bg-white p-8 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Painel</p>
        <h1 className="mt-1 text-2xl font-extrabold">{s.brand.name}</h1>
        {isDemo || demo ? (
          <p className="mt-6 rounded-xl bg-accent/10 p-4 text-sm font-semibold text-accent">
            O admin precisa do Supabase conectado. Configure as variáveis de ambiente e publique de novo.
          </p>
        ) : (
          <form action={login} className="mt-6 space-y-4">
            <input name="email" type="email" required placeholder="E-mail" className="input" />
            <input name="password" type="password" required placeholder="Senha" className="input" />
            {erro && <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">{msgs[erro] ?? "Erro ao entrar."}</p>}
            <button className="btn btn-primary w-full">Entrar</button>
          </form>
        )}
      </div>
    </div>
  );
}
