import type { Metadata } from "next";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <h1 className="animate-rise font-display text-4xl font-semibold tracking-tight">Finalizar compra</h1>
      <CheckoutForm />
    </div>
  );
}
