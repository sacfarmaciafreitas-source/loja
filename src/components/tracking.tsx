"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { Settings } from "@/lib/settings-types";

type W = Window & { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void; dataLayer?: unknown[] };

/** GA4, Google Ads e Meta Pixel configurados em /admin/configuracoes/rastreamento */
export function Tracking({ t }: { t: Settings["tracking"] }) {
  const path = usePathname();
  const gId = t.ga4Id || t.googleAdsId;

  useEffect(() => {
    const w = window as W;
    w.fbq?.("track", "PageView");
  }, [path]);

  return (
    <>
      {gId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gId}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${t.ga4Id ? `gtag('config','${t.ga4Id}');` : ""}${t.googleAdsId ? `gtag('config','${t.googleAdsId}');` : ""}`}
          </Script>
        </>
      )}
      {t.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${t.metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}

export function trackEvent(name: "add_to_cart" | "begin_checkout" | "purchase" | "view_item", data: { value: number; id?: string; transactionId?: string; items?: { id: string; name: string; price: number; qty: number }[] }, t?: Settings["tracking"]) {
  const w = window as W;
  const items = data.items?.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.qty }));
  w.gtag?.("event", name, { currency: "BRL", value: data.value, transaction_id: data.transactionId, items });
  if (name === "purchase" && t?.googleAdsId && t.googleAdsConversionLabel) {
    w.gtag?.("event", "conversion", { send_to: `${t.googleAdsId}/${t.googleAdsConversionLabel}`, value: data.value, currency: "BRL", transaction_id: data.transactionId });
  }
  const fbMap = { add_to_cart: "AddToCart", begin_checkout: "InitiateCheckout", purchase: "Purchase", view_item: "ViewContent" } as const;
  w.fbq?.("track", fbMap[name], { value: data.value, currency: "BRL", content_ids: data.items?.map((i) => i.id) ?? (data.id ? [data.id] : []), content_type: "product" });
}
