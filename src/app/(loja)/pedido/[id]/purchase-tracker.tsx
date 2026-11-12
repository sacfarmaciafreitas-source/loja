"use client";

import { useEffect } from "react";
import { useSettings } from "@/components/settings-context";
import { trackEvent } from "@/components/tracking";

/** Dispara a conversão de compra uma única vez por pedido, quando o pagamento é confirmado. */
export function PurchaseTracker({ id, code, total, items }: { id: string; code: string; total: number; items: { id: string; name: string; price: number; qty: number }[] }) {
  const { settings } = useSettings();
  useEffect(() => {
    const key = `purchase:${id}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {}
    trackEvent("purchase", { value: total, transactionId: code, items }, settings.tracking);
  }, [id, code, total, items, settings.tracking]);
  return null;
}
