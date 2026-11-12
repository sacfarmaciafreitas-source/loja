import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-28 text-center">
      <p className="font-display text-7xl font-semibold text-brand">404</p>
      <h1 className="mt-4 text-xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-muted">O produto ou página que você procura não existe mais.</p>
      <Link href="/" className="btn btn-primary mt-8">Voltar para a loja</Link>
    </div>
  );
}
