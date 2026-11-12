type P = React.SVGProps<SVGSVGElement>;
const base = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const mk = (d: React.ReactNode) => (p: P) => <svg {...base} {...p}>{d}</svg>;

export const IconBag = mk(<><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2.5 3.5h2.6l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.5-1.2l1.7-6.8H6.1" /></>);
export const IconSearch = mk(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const IconUser = mk(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>);
export const IconTruck = mk(<><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>);
export const IconShield = mk(<><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>);
export const IconCard = mk(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>);
export const IconPix = mk(<><path d="m12 3 4 4-4 4-4-4 4-4Z" /><path d="m12 13 4 4-4 4-4-4 4-4Z" /><path d="m3 12 4-4 4 4-4 4-4-4Z" /><path d="m13 12 4-4 4 4-4 4-4-4Z" /></>);
export const IconClose = mk(<path d="M6 6l12 12M18 6 6 18" />);
export const IconArrow = mk(<path d="M5 12h14M13 6l6 6-6 6" />);
export const IconChevron = mk(<path d="m9 6 6 6-6 6" />);
export const IconChevronDown = mk(<path d="m6 9 6 6 6-6" />);
export const IconMenu = mk(<path d="M4 7h16M4 12h16M4 17h16" />);
export const IconCheck = mk(<path d="m5 12 5 5 9-10" />);
export const IconHeart = mk(<path d="M12 20s-7-4.4-9-9.2C1.6 7.3 3.8 4 7.2 4c2 0 3.6 1.2 4.8 3 1.2-1.8 2.8-3 4.8-3 3.4 0 5.6 3.3 4.2 6.8C19 15.6 12 20 12 20Z" />);
export const IconTag = mk(<><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="8.5" r="1.3" /></>);
export const IconAward = mk(<><circle cx="12" cy="9" r="6" /><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7" /></>);
export const IconSparkles = mk(<><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="m12 8 1.4 2.6L16 12l-2.6 1.4L12 16l-1.4-2.6L8 12l2.6-1.4L12 8Z" /></>);
export const IconPercent = mk(<><path d="M19 5 5 19" /><circle cx="7" cy="7" r="2.2" /><circle cx="17" cy="17" r="2.2" /></>);
export const IconHeartPulse = mk(<><path d="M12 20s-7-4.4-9-9.2C1.6 7.3 3.8 4 7.2 4c2 0 3.6 1.2 4.8 3 1.2-1.8 2.8-3 4.8-3 3.4 0 5.6 3.3 4.2 6.8C19 15.6 12 20 12 20Z" /><path d="M6 12h3l1.5-2.5 2 5 1.5-2.5h4" /></>);
export const IconTicket = mk(<><path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3v4Z" transform="translate(0 2)" /><path d="M10 7v10" strokeDasharray="2 2" /></>);
export const IconSnow = mk(<><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" /><path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2" /></>);
export const IconGift = mk(<><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v8h14v-8M12 8v12" /><path d="M12 8c-1.5-3-5-3.5-5-1.5S10 8 12 8Zm0 0c1.5-3 5-3.5 5-1.5S14 8 12 8Z" /></>);
export const IconLeaf = mk(<><path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15" /><path d="M5 19 13 11" /></>);
export const IconDroplet = mk(<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />);
export const IconBaby = mk(<><circle cx="12" cy="11" r="7" /><path d="M9.5 10h.01M14.5 10h.01M10 14c1.2 1 2.8 1 4 0" /><path d="M12 4c-1 0-1.5 1-1 2" /></>);
export const IconPill = mk(<><rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-45 12 12.5)" /><path d="m9.5 9.5 5 5" /></>);
export const IconPaw = mk(<><circle cx="6" cy="10" r="1.8" /><circle cx="9.5" cy="6" r="1.8" /><circle cx="14.5" cy="6" r="1.8" /><circle cx="18" cy="10" r="1.8" /><path d="M8 17c0-3 2-5 4-5s4 2 4 5c0 2-2 2.5-4 2.5S8 19 8 17Z" /></>);
export const IconStar = mk(<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />);
export const IconHeadset = mk(<><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></>);
export const IconChat = mk(<path d="M4 19.5 5.5 15A8 8 0 1 1 9 18.5l-5 1Z" />);
export const IconMail = mk(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6 8.5-6" /></>);
export const IconPhone = mk(<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z" />);
export const IconLock = mk(<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>);
export const IconStore = mk(<><path d="M3 9 5 4h14l2 5" /><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /><path d="M5 12v8h14v-8" /></>);
export const IconImage = mk(<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5L5 20" /></>);
export const IconTrash = mk(<><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>);
export const IconUp = mk(<path d="m6 15 6-6 6 6" />);
export const IconDown = mk(<path d="m6 9 6 6 6-6" />);

/** Ícones escolhíveis no painel (atalhos, benefícios, barra superior). */
export const ICONS: Record<string, (p: P) => React.ReactElement> = {
  award: IconAward,
  sparkles: IconSparkles,
  heart: IconHeart,
  percent: IconPercent,
  heartPulse: IconHeartPulse,
  ticket: IconTicket,
  snow: IconSnow,
  gift: IconGift,
  leaf: IconLeaf,
  droplet: IconDroplet,
  baby: IconBaby,
  pill: IconPill,
  paw: IconPaw,
  star: IconStar,
  truck: IconTruck,
  card: IconCard,
  shield: IconShield,
  tag: IconTag,
  pix: IconPix,
  bag: IconBag,
  store: IconStore,
  headset: IconHeadset,
  lock: IconLock,
};

export const ICON_LABELS: Record<string, string> = {
  award: "Medalha", sparkles: "Brilho", heart: "Coração", percent: "Porcentagem", heartPulse: "Saúde", ticket: "Cupom",
  snow: "Floco", gift: "Presente", leaf: "Folha", droplet: "Gota", baby: "Bebê", pill: "Cápsula", paw: "Pet", star: "Estrela",
  truck: "Caminhão", card: "Cartão", shield: "Escudo", tag: "Etiqueta", pix: "Pix", bag: "Carrinho", store: "Loja", headset: "Atendimento", lock: "Cadeado",
};

export function DynIcon({ name, ...p }: { name: string } & P) {
  const I = ICONS[name];
  return I ? <I {...p} /> : null;
}
