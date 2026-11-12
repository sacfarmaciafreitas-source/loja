import type { Category, Product } from "./types";

export const demoCategories: Category[] = [
  { id: "c1", slug: "dermocosmeticos", name: "Dermocosméticos", blurb: "Cuidado avançado para a pele", position: 0, image_url: null },
  { id: "c2", slug: "higiene", name: "Higiene e Cuidados", blurb: "O essencial do dia a dia", position: 1, image_url: null },
  { id: "c3", slug: "suplementos", name: "Suplementos e Vitaminas", blurb: "Energia e bem-estar", position: 2, image_url: null },
  { id: "c4", slug: "mamae-e-bebe", name: "Mamãe e Bebê", blurb: "Carinho desde o primeiro dia", position: 3, image_url: null },
  { id: "c5", slug: "perfumaria", name: "Perfumaria", blurb: "Fragrâncias para todo momento", position: 4, image_url: null },
  { id: "c6", slug: "saude-em-casa", name: "Saúde em Casa", blurb: "Aparelhos e medidores", position: 5, image_url: null },
];

// Produtos de exemplo usados apenas quando o Supabase não está configurado.
const p = (
  id: number,
  name: string,
  brand: string,
  category_slug: string,
  price: number,
  compare: number | null,
  description: string,
  featured = false,
): Product => ({
  id: `demo-${id}`,
  slug: name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
  name,
  brand,
  gtin: null,
  sku: `DS${1000 + id}`,
  price,
  compare_at_price: compare,
  stock: 50,
  image_url: null,
  category_slug,
  active: true,
  featured,
  description,
});

export const demoProducts: Product[] = [
  p(1, "Protetor Solar Facial FPS 60 Toque Seco 40g", "Dermacare", "dermocosmeticos", 79.9, 99.9, "Proteção UVA e UVB de amplo espectro com acabamento seco e invisível. Ideal para uso diário, inclusive sob a maquiagem.", true),
  p(2, "Sérum Facial Niacinamida 10% 30ml", "Dermacare", "dermocosmeticos", 89.9, 119.9, "Ajuda a uniformizar o tom da pele, controlar a oleosidade e reduzir a aparência dos poros.", true),
  p(3, "Hidratante Facial Gel Ácido Hialurônico 50g", "Hidrasense", "dermocosmeticos", 64.9, null, "Textura em gel de rápida absorção que hidrata por até 48 horas sem pesar."),
  p(4, "Shampoo Antiqueda Cafeína 250ml", "Vitta Hair", "higiene", 49.9, 59.9, "Fórmula com cafeína que fortalece os fios desde a raiz.", true),
  p(5, "Desodorante Aerosol Antitranspirante 72h 150ml", "Fresh Day", "higiene", 17.9, null, "Proteção prolongada contra suor e odores, sem manchar a roupa."),
  p(6, "Kit Escova Dental Ultra Macia 3 unidades", "Oralis", "higiene", 24.9, 32.9, "Cerdas ultra macias que limpam sem agredir a gengiva."),
  p(7, "Vitamina D3 2.000UI 60 cápsulas", "Nutrivida", "suplementos", 39.9, 49.9, "Suplemento de vitamina D para apoio à imunidade e à saúde dos ossos.", true),
  p(8, "Colágeno Hidrolisado com Vitamina C 300g", "Nutrivida", "suplementos", 89.9, 109.9, "Colágeno de alta absorção para pele, cabelos e unhas."),
  p(9, "Magnésio Dimalato 500mg 60 cápsulas", "Nutrivida", "suplementos", 54.9, null, "Contribui para a função muscular e a redução do cansaço."),
  p(10, "Fralda Infantil Confort XG 64 unidades", "Bebê Feliz", "mamae-e-bebe", 89.9, 109.9, "Camada ultra absorvente e cintura elástica para noites tranquilas.", true),
  p(11, "Lenço Umedecido Infantil 96 unidades", "Bebê Feliz", "mamae-e-bebe", 12.9, null, "Sem álcool e sem perfume, ideal para peles sensíveis."),
  p(12, "Body Splash Baunilha 250ml", "Essenza", "perfumaria", 59.9, 79.9, "Fragrância doce e envolvente para usar a qualquer hora do dia.", true),
  p(13, "Termômetro Digital Clínico", "MedCheck", "saude-em-casa", 29.9, 39.9, "Leitura rápida em 60 segundos com alarme sonoro."),
  p(14, "Monitor de Pressão de Braço Automático", "MedCheck", "saude-em-casa", 189.9, 239.9, "Medição automática com memória para 60 leituras.", true),
];
