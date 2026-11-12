import { CartProvider } from "@/components/cart";
import { CartDrawer } from "@/components/cart-drawer";
import { FavoritesProvider } from "@/components/favorites";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SettingsProvider } from "@/components/settings-context";
import { Tracking } from "@/components/tracking";
import { getCategories } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { isDemo } from "@/lib/supabase";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories().catch(() => [])]);
  return (
    <SettingsProvider value={{ settings, categories }}>
      <FavoritesProvider>
        <CartProvider>
          {isDemo && <div className="bg-accent px-4 py-1 text-center text-[11px] font-bold text-white">Modo demonstração: conecte o Supabase para usar produtos e pedidos reais.</div>}
          <Header />
          <main className="min-h-[50vh]">{children}</main>
          <Footer />
          <CartDrawer />
          <Tracking t={settings.tracking} />
        </CartProvider>
      </FavoritesProvider>
    </SettingsProvider>
  );
}
