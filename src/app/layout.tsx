import type { Metadata, Viewport } from "next";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(site),
    title: { default: s.seo.title || s.brand.name, template: `%s | ${s.brand.name}` },
    description: s.seo.description,
    icons: s.brand.faviconUrl ? { icon: s.brand.faviconUrl } : undefined,
    openGraph: { siteName: s.brand.name, type: "website", locale: "pt_BR", images: s.seo.ogImage ? [s.seo.ogImage] : [] },
    twitter: { card: "summary_large_image" },
    verification: s.seo.googleVerification ? { google: s.seo.googleVerification } : undefined,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const s = await getSettings();
  return { themeColor: s.theme.primary, width: "device-width", initialScale: 1 };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const t = s.theme;
  const vars = {
    "--brand": t.primary,
    "--brand-dark": t.primaryDark,
    "--brand-ink": t.primaryText,
    "--accent": t.accent,
    "--ink": t.text,
    "--bg": t.background,
    "--soft": t.soft,
    "--foot": t.footerBg,
    "--radius": `${t.radius}px`,
    "--font": `"${t.font}"`,
  } as React.CSSProperties;
  const fontParam = t.font.replace(/ /g, "+");

  return (
    <html lang="pt-BR" style={vars}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${fontParam}:wght@400;500;600;700;800&display=swap`} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
