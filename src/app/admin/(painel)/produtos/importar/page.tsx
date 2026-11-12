import { requireAdmin } from "@/lib/admin";
import { DemoOnly } from "../../demo-only";
import { Importer } from "./importer";

export default async function ImportPage() {
  const { demo } = await requireAdmin();
  if (demo) return <DemoOnly />;
  return (
    <>
      <h1 className="text-2xl font-extrabold">Importar produtos</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Envie uma planilha CSV (salve do Excel ou Google Sheets como CSV). Produtos com a mesma URL são atualizados, os novos são criados. Categorias que não existirem são criadas.
      </p>
      <Importer />
    </>
  );
}
