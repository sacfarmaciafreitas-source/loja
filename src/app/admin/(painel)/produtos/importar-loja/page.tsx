import { requireAdmin } from "@/lib/admin";
import { DemoOnly } from "../../demo-only";
import { StoreImporter } from "./store-importer";

// cada lote baixa várias fotos: dá mais tempo para a função
export const maxDuration = 60;

export default async function ImportStorePage() {
  const { demo } = await requireAdmin();
  if (demo) return <DemoOnly />;
  return (
    <>
      <h1 className="text-2xl font-extrabold">Importar de outra loja</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Lê o catálogo de uma loja do mesmo formato, cria as categorias e copia os produtos com as fotos salvas no seu próprio Storage. Pode rodar de novo quando quiser: produtos com a mesma URL são atualizados.
      </p>
      <StoreImporter />
    </>
  );
}
