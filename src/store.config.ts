/**
 * VALORES PADRÃO DA LOJA
 * Tudo aqui pode ser alterado pelo painel em /admin/configuracoes.
 * O que for salvo no painel tem prioridade sobre este arquivo.
 * No futuro o gerador por prompt vai escrever este arquivo sozinho.
 */
import type { Settings } from "@/lib/settings-types";

export const defaultSettings: Settings = {
  brand: {
    name: "Drogaria Silva",
    tagline: "Beleza, higiene e cuidados pessoais online",
    logoUrl: "",
    logoHeight: 44,
    faviconUrl: "",
  },
  theme: {
    primary: "#0B4EA2",
    primaryDark: "#083B7C",
    primaryText: "#FFFFFF",
    accent: "#E02424",
    text: "#3F3F46",
    background: "#FFFFFF",
    soft: "#EEF4FC",
    footerBg: "#F4F4F5",
    font: "Inter",
    radius: 12,
  },
  topbar: {
    messages: [
      { icon: "truck", text: "Frete grátis acima de R$ 199,00" },
      { icon: "", text: "Produtos originais com nota fiscal" },
    ],
  },
  menu: [
    { label: "Dermocosméticos", href: "/c/dermocosmeticos" },
    { label: "Higiene", href: "/c/higiene" },
    { label: "Suplementos", href: "/c/suplementos" },
    { label: "Mamãe & Bebê", href: "/c/mamae-e-bebe" },
    { label: "Perfumaria", href: "/c/perfumaria" },
    { label: "Saúde em Casa", href: "/c/saude-em-casa" },
    { label: "Fale Conosco", href: "/contato" },
  ],
  banners: [],
  shortcuts: [
    { label: "Mais Buscados", icon: "award", href: "/ofertas" },
    { label: "Perfumes", icon: "sparkles", href: "/c/perfumaria" },
    { label: "Dermocosméticos", icon: "heart", href: "/c/dermocosmeticos" },
    { label: "Ofertas", icon: "percent", href: "/ofertas" },
    { label: "Saúde em Casa", icon: "heartPulse", href: "/c/saude-em-casa" },
    { label: "Suplementos", icon: "leaf", href: "/c/suplementos" },
    { label: "Higiene", icon: "droplet", href: "/c/higiene" },
    { label: "Mamãe & Bebê", icon: "baby", href: "/c/mamae-e-bebe" },
  ],
  benefits: [
    { icon: "truck", title: "Frete rápido", text: "Receba seus pedidos com comodidade." },
    { icon: "pix", title: "Desconto no Pix", text: "Aprovação na hora e preço menor." },
    { icon: "shield", title: "Compra segura", text: "Ambiente protegido do início ao fim." },
    { icon: "tag", title: "Ofertas especiais", text: "Economize em produtos selecionados." },
  ],
  homeSections: [
    { title: "Mais buscados", subtitle: "Os produtos que mais aparecem nas buscas dos nossos clientes.", source: "featured", category: "", limit: 12, active: true },
    { title: "Dermocosméticos", subtitle: "Cuidado avançado para a pele.", source: "category", category: "dermocosmeticos", limit: 12, active: true },
    { title: "Higiene e Cuidados", subtitle: "Shampoo, sabonetes, desodorantes e itens do dia a dia.", source: "category", category: "higiene", limit: 12, active: true },
    { title: "Suplementos & Vitaminas", subtitle: "Vitaminas, colágeno e minerais para a saúde em dia.", source: "category", category: "suplementos", limit: 12, active: true },
    { title: "Ofertas especiais", subtitle: "Seleção com desconto direto no preço.", source: "sale", category: "", limit: 12, active: true },
  ],
  support: {
    enabled: true,
    title: "Central de atendimento",
    text: "Confira as dúvidas mais frequentes ou fale com a nossa equipe.",
    buttonLabel: "Falar com atendimento",
  },
  newsletter: {
    enabled: true,
    title: "Receba novidades e ofertas",
    text: "Cadastre seu e-mail e fique por dentro dos lançamentos e promoções da loja.",
  },
  footer: {
    about: "Loja de produtos de saúde, higiene, beleza, perfumaria e suplementos alimentares. Itens originais, lacrados e com nota fiscal.",
    paymentFlags: ["visa", "mastercard", "elo", "amex", "hipercard", "diners", "pix"],
  },
  company: {
    legalName: "PREENCHER RAZÃO SOCIAL LTDA",
    tradeName: "Drogaria Silva",
    cnpj: "00.000.000/0000-00",
    address: "Rua Exemplo, 100, Centro",
    city: "Cidade",
    state: "UF",
    zip: "00000-000",
    email: "atendimento@drogariasilva.com.br",
    phone: "(00) 00000-0000",
    whatsapp: "5500000000000",
    hours: "Segunda a Sexta, 9:00 às 18:00",
  },
  commerce: {
    pixDiscountPercent: 5,
    maxInstallments: 12,
    freeShippingFrom: 199,
    flatShipping: 19.9,
    shippingDays: "3 a 9 dias úteis",
    returnDays: 7,
    minOrder: 0,
    pixExpiresMinutes: 30,
    cardEnabled: false,
  },
  seo: {
    title: "Drogaria Silva | Beleza, higiene e cuidados pessoais online",
    description: "Beleza, perfumaria, higiene e cuidados pessoais. Produtos originais, parcelamento em até 12x no cartão e entrega para todo o Brasil.",
    ogImage: "",
    googleVerification: "",
  },
  tracking: {
    ga4Id: "",
    googleAdsId: "",
    googleAdsConversionLabel: "",
    metaPixelId: "",
  },
  merchant: {
    includeOutOfStock: false,
    googleCategory: "",
    defaultBrand: "",
    condition: "new",
    includeShipping: true,
    utm: "",
  },
  pages: {},
};
