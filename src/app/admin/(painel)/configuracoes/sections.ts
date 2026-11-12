/** Definição declarativa de cada tela de configuração do painel. */

export type Field =
  | { type: "text" | "textarea" | "html" | "color" | "image" | "icon" | "url"; key: string; label: string; help?: string; placeholder?: string; wide?: boolean }
  | { type: "number"; key: string; label: string; help?: string; step?: number; min?: number; max?: number }
  | { type: "toggle"; key: string; label: string; help?: string }
  | { type: "select"; key: string; label: string; help?: string; options: { value: string; label: string }[] | "fonts" | "categories" | "providers" }
  | { type: "checks"; key: string; label: string; help?: string; options: { value: string; label: string }[] }
  | { type: "list"; key: string; label: string; help?: string; item: Field[]; newItem: Record<string, unknown>; titleKey?: string }
  | { type: "secret"; key: string; label: string; help?: string }
  | { type: "pages"; key: string; label: string; help?: string }
  | { type: "info"; label: string; help: string; key?: string };

export type Section = { slug: string; title: string; description: string; group: string; fields: Field[] };

const sourceOptions = [
  { value: "featured", label: "Produtos em destaque" },
  { value: "category", label: "Uma categoria" },
  { value: "sale", label: "Produtos com desconto" },
  { value: "all", label: "Todos os produtos" },
];

export const SECTIONS: Section[] = [
  {
    slug: "aparencia",
    group: "Loja",
    title: "Aparência",
    description: "Logo, cores, fonte e arredondamento. As mudanças aparecem na loja em até 1 minuto.",
    fields: [
      { type: "text", key: "brand.name", label: "Nome da loja" },
      { type: "text", key: "brand.tagline", label: "Frase curta" },
      { type: "image", key: "brand.logoUrl", label: "Logo", help: "PNG ou SVG com fundo transparente. Sem logo, a loja mostra o nome com um ícone." },
      { type: "number", key: "brand.logoHeight", label: "Altura do logo (px)", min: 24, max: 90 },
      { type: "image", key: "brand.faviconUrl", label: "Favicon (ícone da aba)", help: "Imagem quadrada, 64x64 ou maior." },
      { type: "color", key: "theme.primary", label: "Cor principal", help: "Botões, preços e destaques" },
      { type: "color", key: "theme.primaryDark", label: "Cor principal escura", help: "Barra superior e bloco de atendimento" },
      { type: "color", key: "theme.primaryText", label: "Texto sobre a cor principal" },
      { type: "color", key: "theme.accent", label: "Cor de destaque", help: "Selos de desconto e alertas" },
      { type: "color", key: "theme.text", label: "Cor do texto" },
      { type: "color", key: "theme.background", label: "Fundo do site" },
      { type: "color", key: "theme.soft", label: "Fundo suave", help: "Ícones dos atalhos e caixas de Pix" },
      { type: "color", key: "theme.footerBg", label: "Fundo do rodapé" },
      { type: "select", key: "theme.font", label: "Fonte", options: "fonts" },
      { type: "number", key: "theme.radius", label: "Arredondamento dos cantos (px)", min: 0, max: 28 },
    ],
  },
  {
    slug: "banners",
    group: "Loja",
    title: "Banners",
    description: "Carrossel do topo da home. Tamanho ideal: 1920x820 no computador e 1080x1080 no celular.",
    fields: [
      {
        type: "list",
        key: "banners",
        label: "Banners",
        titleKey: "alt",
        newItem: { image: "", imageMobile: "", href: "", alt: "", active: true },
        item: [
          { type: "image", key: "image", label: "Imagem para computador" },
          { type: "image", key: "imageMobile", label: "Imagem para celular (opcional)" },
          { type: "text", key: "alt", label: "Descrição da imagem", placeholder: "Ex.: Promoção de protetor solar" },
          { type: "url", key: "href", label: "Link ao clicar", placeholder: "/c/dermocosmeticos" },
          { type: "toggle", key: "active", label: "Ativo" },
        ],
      },
    ],
  },
  {
    slug: "home",
    group: "Loja",
    title: "Página inicial",
    description: "Atalhos redondos, barra de benefícios, vitrines de produtos e blocos finais.",
    fields: [
      {
        type: "list",
        key: "shortcuts",
        label: "Atalhos com ícone",
        titleKey: "label",
        newItem: { label: "Novo atalho", icon: "star", href: "/" },
        item: [
          { type: "text", key: "label", label: "Texto" },
          { type: "icon", key: "icon", label: "Ícone" },
          { type: "url", key: "href", label: "Link", placeholder: "/c/suplementos" },
        ],
      },
      {
        type: "list",
        key: "benefits",
        label: "Barra de benefícios",
        titleKey: "title",
        newItem: { icon: "star", title: "Novo benefício", text: "" },
        item: [
          { type: "icon", key: "icon", label: "Ícone" },
          { type: "text", key: "title", label: "Título" },
          { type: "text", key: "text", label: "Texto" },
        ],
      },
      {
        type: "list",
        key: "homeSections",
        label: "Vitrines de produtos",
        titleKey: "title",
        newItem: { title: "Nova vitrine", subtitle: "", source: "featured", category: "", limit: 12, active: true },
        item: [
          { type: "text", key: "title", label: "Título" },
          { type: "text", key: "subtitle", label: "Subtítulo" },
          { type: "select", key: "source", label: "Quais produtos", options: sourceOptions },
          { type: "select", key: "category", label: "Categoria (se escolheu “Uma categoria”)", options: "categories" },
          { type: "number", key: "limit", label: "Quantidade", min: 1, max: 40 },
          { type: "toggle", key: "active", label: "Mostrar" },
        ],
      },
      { type: "toggle", key: "support.enabled", label: "Mostrar bloco de atendimento" },
      { type: "text", key: "support.title", label: "Título do atendimento" },
      { type: "text", key: "support.text", label: "Texto do atendimento" },
      { type: "text", key: "support.buttonLabel", label: "Botão do atendimento" },
      { type: "toggle", key: "newsletter.enabled", label: "Mostrar newsletter" },
      { type: "text", key: "newsletter.title", label: "Título da newsletter" },
      { type: "text", key: "newsletter.text", label: "Texto da newsletter" },
    ],
  },
  {
    slug: "menu",
    group: "Loja",
    title: "Menu e barra superior",
    description: "Links do menu abaixo da busca, mensagens da faixa do topo e rodapé.",
    fields: [
      {
        type: "list",
        key: "topbar.messages",
        label: "Mensagens da barra superior",
        titleKey: "text",
        newItem: { icon: "", text: "Nova mensagem" },
        item: [
          { type: "icon", key: "icon", label: "Ícone (opcional)" },
          { type: "text", key: "text", label: "Texto" },
        ],
      },
      {
        type: "list",
        key: "menu",
        label: "Links do menu",
        titleKey: "label",
        newItem: { label: "Novo link", href: "/" },
        item: [
          { type: "text", key: "label", label: "Texto" },
          { type: "url", key: "href", label: "Link", placeholder: "/c/perfumaria" },
        ],
      },
      { type: "textarea", key: "footer.about", label: "Texto sobre a loja (rodapé)" },
      {
        type: "checks",
        key: "footer.paymentFlags",
        label: "Bandeiras no rodapé",
        help: "As de cartão só aparecem se o cartão estiver ativado em Pagamentos.",
        options: ["visa", "mastercard", "elo", "amex", "hipercard", "diners", "pix", "boleto"].map((v) => ({ value: v, label: v.toUpperCase() })),
      },
    ],
  },
  {
    slug: "empresa",
    group: "Negócio",
    title: "Empresa e atendimento",
    description: "Aparece no rodapé, nas políticas e nos dados estruturados. O Google Merchant exige dados reais e iguais aos do CNPJ.",
    fields: [
      { type: "text", key: "company.legalName", label: "Razão social" },
      { type: "text", key: "company.tradeName", label: "Nome fantasia" },
      { type: "text", key: "company.cnpj", label: "CNPJ" },
      { type: "text", key: "company.address", label: "Endereço (rua, número, bairro)" },
      { type: "text", key: "company.city", label: "Cidade" },
      { type: "text", key: "company.state", label: "UF" },
      { type: "text", key: "company.zip", label: "CEP" },
      { type: "text", key: "company.email", label: "E-mail de atendimento" },
      { type: "text", key: "company.phone", label: "Telefone exibido" },
      { type: "text", key: "company.whatsapp", label: "WhatsApp (só números com DDI)", placeholder: "5511999999999" },
      { type: "text", key: "company.hours", label: "Horário de atendimento" },
    ],
  },
  {
    slug: "comercial",
    group: "Negócio",
    title: "Frete e regras comerciais",
    description: "Valores usados na loja, no checkout, no feed do Merchant e nas políticas.",
    fields: [
      { type: "number", key: "commerce.freeShippingFrom", label: "Frete grátis a partir de (R$)", help: "Use 0 para não ter frete grátis", step: 0.01, min: 0 },
      { type: "number", key: "commerce.flatShipping", label: "Frete fixo (R$)", step: 0.01, min: 0 },
      { type: "text", key: "commerce.shippingDays", label: "Prazo de entrega exibido", placeholder: "3 a 9 dias úteis" },
      { type: "number", key: "commerce.pixDiscountPercent", label: "Desconto no Pix (%)", step: 0.5, min: 0, max: 50 },
      { type: "number", key: "commerce.minOrder", label: "Pedido mínimo (R$)", help: "0 = sem mínimo", step: 0.01, min: 0 },
      { type: "number", key: "commerce.returnDays", label: "Prazo para devolução (dias)", min: 7 },
    ],
  },
  {
    slug: "pagamentos",
    group: "Negócio",
    title: "Pagamentos",
    description: "Gateway que gera o Pix e confirma o pagamento. As chaves ficam guardadas só no servidor e nunca aparecem na loja.",
    fields: [
      { type: "select", key: "secrets.provider", label: "Gateway", options: "providers" },
      { type: "text", key: "secrets.apiUrl", label: "URL da API", placeholder: "https://api.seugateway.com/v1" },
      { type: "secret", key: "secrets.apiKey", label: "Chave da API" },
      { type: "secret", key: "secrets.webhookSecret", label: "Segredo do webhook", help: "Usado para validar que a confirmação veio mesmo do gateway." },
      { type: "info", label: "URL do webhook", help: "Cadastre no gateway: SEU_DOMINIO/api/webhooks/payment" },
      { type: "number", key: "commerce.pixExpiresMinutes", label: "Validade do Pix (minutos)", min: 5, max: 1440 },
      { type: "toggle", key: "commerce.cardEnabled", label: "Aceitar cartão de crédito", help: "Ative só quando o gateway processar cartão. Enquanto desligado, a loja não anuncia parcelamento." },
      { type: "number", key: "commerce.maxInstallments", label: "Parcelas sem juros no cartão", min: 1, max: 12 },
    ],
  },
  {
    slug: "merchant",
    group: "Google",
    title: "Google Merchant",
    description: "Opções do feed de produtos. Cadastre no Merchant Center como feed agendado com a URL: SEU_DOMINIO/feed.xml",
    fields: [
      { type: "toggle", key: "merchant.includeOutOfStock", label: "Incluir produtos sem estoque" },
      { type: "toggle", key: "merchant.includeShipping", label: "Enviar frete no feed" },
      { type: "text", key: "merchant.defaultBrand", label: "Marca padrão", help: "Usada quando o produto não tem marca." },
      { type: "text", key: "merchant.googleCategory", label: "Categoria do Google (ID ou caminho)", placeholder: "Ex.: 491 (Saúde e beleza)" },
      { type: "select", key: "merchant.condition", label: "Condição", options: [{ value: "new", label: "Novo" }, { value: "refurbished", label: "Recondicionado" }, { value: "used", label: "Usado" }] },
      { type: "text", key: "merchant.utm", label: "Parâmetros UTM nos links", placeholder: "utm_source=google&utm_medium=shopping" },
      { type: "text", key: "seo.googleVerification", label: "Código de verificação do site", help: "No Merchant, escolha verificar por tag HTML e cole só o valor de content." },
    ],
  },
  {
    slug: "rastreamento",
    group: "Google",
    title: "Rastreamento e conversões",
    description: "Tags de anúncios. Eventos enviados: visualização de produto, adicionar ao carrinho, início de checkout e compra paga.",
    fields: [
      { type: "text", key: "tracking.ga4Id", label: "Google Analytics 4 (ID)", placeholder: "G-XXXXXXXXXX" },
      { type: "text", key: "tracking.googleAdsId", label: "Google Ads (ID da tag)", placeholder: "AW-123456789" },
      { type: "text", key: "tracking.googleAdsConversionLabel", label: "Rótulo da conversão de compra", placeholder: "AbCdEfGhIjK" },
      { type: "text", key: "tracking.metaPixelId", label: "Meta Pixel (ID)", placeholder: "123456789012345" },
    ],
  },
  {
    slug: "seo",
    group: "Google",
    title: "SEO e compartilhamento",
    description: "Como a loja aparece no Google e quando o link é compartilhado.",
    fields: [
      { type: "text", key: "seo.title", label: "Título da página inicial" },
      { type: "textarea", key: "seo.description", label: "Descrição", help: "Até 160 caracteres." },
      { type: "image", key: "seo.ogImage", label: "Imagem de compartilhamento", help: "1200x630" },
    ],
  },
  {
    slug: "paginas",
    group: "Negócio",
    title: "Páginas institucionais",
    description: "Deixe em branco para usar o texto automático, que já se atualiza com os dados da empresa e do frete.",
    fields: [{ type: "pages", key: "pages", label: "Páginas" }],
  },
];

export const sectionBySlug = (s: string) => SECTIONS.find((x) => x.slug === s);
