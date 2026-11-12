import { money } from "./format";
import type { Settings } from "./settings-types";

export const POLICY_SLUGS = [
  ["quem-somos", "Quem somos"],
  ["entrega-e-frete", "Entrega e frete"],
  ["trocas-e-devolucoes", "Trocas e devoluções"],
  ["formas-de-pagamento", "Formas de pagamento"],
  ["politica-de-privacidade", "Política de privacidade"],
  ["termos-de-uso", "Termos de uso"],
  ["politica-de-cookies", "Cookies e segurança"],
  ["contato", "Fale conosco"],
] as const;

/** Textos padrão gerados a partir das configurações. O painel pode sobrescrever qualquer um. */
export function defaultPolicies(s: Settings): Record<string, { title: string; body: string }> {
  const c = s.company;
  const m = s.commerce;
  const empresa = `${c.legalName}, inscrita no CNPJ ${c.cnpj}, com sede em ${c.address}, ${c.city}/${c.state}, CEP ${c.zip}`;
  const frete = m.freeShippingFrom > 0
    ? `<li>Frete grátis em compras a partir de ${money(m.freeShippingFrom)}</li><li>Abaixo desse valor, frete fixo de ${money(m.flatShipping)}</li>`
    : `<li>Frete fixo de ${money(m.flatShipping)} para todo o Brasil</li>`;

  return {
    "quem-somos": {
      title: "Quem somos",
      body: `<p>A ${s.brand.name} é a loja online da ${empresa}.</p><p>${s.footer.about}</p>
<h2>Nosso compromisso</h2><ul><li>Somente produtos originais, adquiridos de distribuidores autorizados</li><li>Nota fiscal em todos os pedidos</li><li>Atendimento humano: ${c.hours}</li></ul>
<h2>Fale com a gente</h2><p>E-mail: ${c.email}<br/>Telefone e WhatsApp: ${c.phone}</p>`,
    },
    "entrega-e-frete": {
      title: "Entrega e frete",
      body: `<p>Entregamos para todo o Brasil. O prazo estimado é de <b>${m.shippingDays}</b> após a confirmação do pagamento, variando conforme a região.</p>
<h2>Valores</h2><ul>${frete}</ul>
<h2>Processamento</h2><p>Pedidos pagos até as 14h em dias úteis são separados no mesmo dia. O código de rastreio fica disponível em “Acompanhar pedido”.</p>
<h2>Problemas na entrega</h2><p>Se o pedido não chegar no prazo ou chegar danificado, fale com ${c.email} e resolvemos com reenvio ou reembolso integral.</p>`,
    },
    "trocas-e-devolucoes": {
      title: "Trocas e devoluções",
      body: `<p>Seguindo o Código de Defesa do Consumidor (art. 49), você pode desistir da compra em até <b>${m.returnDays} dias corridos</b> após o recebimento, sem precisar justificar.</p>
<h2>Como solicitar</h2><ul><li>Envie e-mail para ${c.email} com o número do pedido</li><li>Enviamos as instruções de postagem sem custo para você</li><li>O produto deve estar lacrado e sem sinais de uso, salvo em caso de defeito</li></ul>
<h2>Reembolso</h2><p>Após recebermos o produto, o reembolso é feito em até 7 dias úteis, pelo mesmo meio de pagamento. Compras via Pix são devolvidas por Pix para a conta de origem.</p>
<h2>Produtos com defeito</h2><p>Produtos com defeito de fabricação podem ser trocados em até 90 dias.</p>`,
    },
    "formas-de-pagamento": {
      title: "Formas de pagamento",
      body: `<h2>Pix</h2><p>Aprovação imediata e <b>${m.pixDiscountPercent}% de desconto</b> sobre os produtos. O QR Code vale por ${m.pixExpiresMinutes} minutos.</p>
${m.cardEnabled ? `<h2>Cartão de crédito</h2><p>Parcelamento em até ${m.maxInstallments}x sem juros nas principais bandeiras.</p>` : ""}
<h2>Segurança</h2><p>O site usa conexão criptografada (HTTPS). Não armazenamos dados de pagamento: a cobrança é processada por instituição de pagamento autorizada.</p>`,
    },
    "politica-de-privacidade": {
      title: "Política de privacidade",
      body: `<p>Esta política explica como a ${empresa} trata seus dados pessoais, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
<h2>Dados coletados</h2><p>Nome, CPF, e-mail, telefone e endereço de entrega, informados por você na compra, além de dados de navegação (cookies).</p>
<h2>Para que usamos</h2><ul><li>Processar e entregar o pedido</li><li>Emitir nota fiscal</li><li>Prevenir fraudes</li><li>Enviar comunicações, se você autorizar</li></ul>
<h2>Compartilhamento</h2><p>Somente com transportadoras, instituição de pagamento e órgãos fiscais, na medida necessária. Não vendemos seus dados.</p>
<h2>Seus direitos</h2><p>Você pode pedir acesso, correção ou exclusão dos seus dados pelo e-mail ${c.email}.</p>`,
    },
    "termos-de-uso": {
      title: "Termos de uso",
      body: `<p>Ao usar este site você concorda com estes termos. O site é operado por ${empresa}.</p>
<h2>Preços e estoque</h2><p>Preços e disponibilidade podem mudar sem aviso. O preço válido é o exibido no momento da finalização do pedido.</p>
<h2>Pedidos</h2><p>Podemos cancelar pedidos com indício de fraude ou erro evidente de preço, com reembolso integral.</p>
<h2>Produtos</h2><p>As informações dos produtos não substituem a orientação de um profissional de saúde. Leia sempre o rótulo.</p>
<h2>Foro</h2><p>Fica eleito o foro do domicílio do consumidor.</p>`,
    },
    "politica-de-cookies": {
      title: "Cookies e segurança",
      body: `<p>Usamos cookies para manter seu carrinho, lembrar seus favoritos e medir o desempenho do site e dos anúncios.</p>
<h2>Tipos de cookies</h2><ul><li>Essenciais: carrinho e segurança</li><li>Medição: estatísticas de visitas e conversões</li><li>Publicidade: anúncios mais relevantes</li></ul>
<h2>Segurança</h2><p>Todo o tráfego do site é criptografado com HTTPS/TLS. Você pode apagar os cookies a qualquer momento nas configurações do seu navegador.</p>`,
    },
    contato: {
      title: "Fale conosco",
      body: `<p>Estamos aqui para ajudar.</p><ul><li>E-mail: ${c.email}</li><li>Telefone e WhatsApp: ${c.phone}</li><li>Horário: ${c.hours}</li><li>Endereço: ${c.address}, ${c.city}/${c.state}, CEP ${c.zip}</li></ul><p>${c.legalName} · CNPJ ${c.cnpj}</p>`,
    },
  };
}

export function getPolicy(s: Settings, slug: string) {
  const def = defaultPolicies(s)[slug];
  if (!def) return null;
  const o = s.pages[slug];
  return { title: o?.title || def.title, body: o?.body || def.body };
}
