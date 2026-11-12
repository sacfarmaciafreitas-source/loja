export function DemoOnly() {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
      <p className="font-bold">Esta área precisa do Supabase conectado.</p>
      <p className="mt-1 text-sm text-muted">No modo demo só as configurações da loja podem ser testadas.</p>
    </div>
  );
}
