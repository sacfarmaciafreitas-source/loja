export type LinkItem = { label: string; href: string };
export type Banner = { image: string; imageMobile: string; href: string; alt: string; active: boolean };
export type Shortcut = { label: string; icon: string; href: string };
export type Benefit = { icon: string; title: string; text: string };
export type HomeSection = {
  title: string;
  subtitle: string;
  source: "featured" | "category" | "sale" | "all";
  category: string;
  limit: number;
  active: boolean;
};

export type Settings = {
  brand: { name: string; tagline: string; logoUrl: string; logoHeight: number; faviconUrl: string };
  theme: {
    primary: string;
    primaryDark: string;
    primaryText: string;
    accent: string;
    text: string;
    background: string;
    soft: string;
    footerBg: string;
    font: string;
    radius: number;
  };
  topbar: { messages: { icon: string; text: string }[] };
  menu: LinkItem[];
  banners: Banner[];
  shortcuts: Shortcut[];
  benefits: Benefit[];
  homeSections: HomeSection[];
  support: { enabled: boolean; title: string; text: string; buttonLabel: string };
  newsletter: { enabled: boolean; title: string; text: string };
  footer: { about: string; paymentFlags: string[] };
  company: {
    legalName: string;
    tradeName: string;
    cnpj: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    email: string;
    phone: string;
    whatsapp: string;
    hours: string;
  };
  commerce: {
    pixDiscountPercent: number;
    maxInstallments: number;
    freeShippingFrom: number;
    flatShipping: number;
    shippingDays: string;
    returnDays: number;
    minOrder: number;
    pixExpiresMinutes: number;
    cardEnabled: boolean;
  };
  seo: { title: string; description: string; ogImage: string; googleVerification: string };
  tracking: { ga4Id: string; googleAdsId: string; googleAdsConversionLabel: string; metaPixelId: string };
  merchant: {
    includeOutOfStock: boolean;
    googleCategory: string;
    defaultBrand: string;
    condition: "new" | "refurbished" | "used";
    includeShipping: boolean;
    utm: string;
  };
  pages: Record<string, { title: string; body: string }>;
};

export type Secrets = { provider: string; apiUrl: string; apiKey: string; webhookSecret: string };

export const FONTS = ["Inter", "Manrope", "Poppins", "Nunito Sans", "Montserrat", "Roboto", "Open Sans", "DM Sans"];
