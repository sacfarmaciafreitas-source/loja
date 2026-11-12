import { BannerCarousel } from "@/components/banner-carousel";
import { Benefits, Newsletter, Shortcuts, SupportBlock } from "@/components/home-blocks";
import { ProductRail } from "@/components/product-rail";
import { getProducts } from "@/lib/data";
import { getSettings } from "@/lib/settings";

export const revalidate = 300;

export default async function Home() {
  const s = await getSettings();
  const sections = s.homeSections.filter((x) => x.active);
  const rails = await Promise.all(
    sections.map((sec) =>
      getProducts({
        featured: sec.source === "featured",
        sale: sec.source === "sale",
        category: sec.source === "category" ? sec.category : undefined,
        limit: sec.limit || 12,
      }).catch(() => []),
    ),
  );

  return (
    <>
      <section className="container-store mt-4 md:mt-5">
        <BannerCarousel banners={s.banners} />
      </section>
      <Shortcuts />
      <Benefits />
      {sections.map((sec, i) => (
        <ProductRail
          key={i}
          title={sec.title}
          subtitle={sec.subtitle}
          href={sec.source === "category" && sec.category ? `/c/${sec.category}` : sec.source === "sale" ? "/ofertas" : sec.source === "featured" ? "/ofertas?tipo=destaques" : "/busca"}
          products={rails[i]}
        />
      ))}
      <SupportBlock />
      <Newsletter />
    </>
  );
}
