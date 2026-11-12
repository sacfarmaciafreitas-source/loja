import "server-only";
import { getSecrets } from "./settings";

/**
 * ADAPTADOR DE GATEWAY
 * A loja só conversa com esta interface. O gateway e as chaves são escolhidos em
 * /admin/configuracoes/pagamentos (ou pelas variáveis de ambiente PAYMENT_*).
 */

export type PixChargeInput = {
  orderId: string;
  orderCode: string;
  amount: number; // em reais
  customer: { name: string; email: string; document: string; phone: string };
  description: string;
  expiresMinutes?: number;
};

export type PixCharge = { id: string; pixCode: string; expiresAt: string };

export type PaymentProvider = {
  name: string;
  createPixCharge(input: PixChargeInput): Promise<PixCharge>;
  /** Valida o webhook e devolve o id da cobrança (ou null se não for evento de pagamento). */
  parseWebhook(req: Request, rawBody: string): Promise<{ chargeId: string; paid: boolean } | null>;
};

export const PROVIDERS = [
  { id: "mock", label: "Modo teste (sem cobrança real)" },
  { id: "vaultic", label: "Vaultic" },
  { id: "primecash", label: "PrimeCash" },
];

const mock: PaymentProvider = {
  name: "mock",
  async createPixCharge(i) {
    const id = `mock_${i.orderCode}_${Date.now()}`;
    const value = i.amount.toFixed(2);
    return {
      id,
      pixCode: `00020126580014BR.GOV.BCB.PIX0136TESTE-${i.orderCode}520400005303986540${value.length}${value}5802BR5913LOJA TESTE6009SAO PAULO62070503***6304TEST`,
      expiresAt: new Date(Date.now() + (i.expiresMinutes ?? 30) * 60_000).toISOString(),
    };
  },
  async parseWebhook() {
    return null;
  },
};

/** Contrato REST usado por Vaultic e PrimeCash. Ajustar só aqui quando a documentação final mudar. */
function rest(name: string, cfg: { apiUrl: string; apiKey: string; webhookSecret: string }): PaymentProvider {
  return {
    name,
    async createPixCharge(i) {
      if (!cfg.apiUrl || !cfg.apiKey) throw new Error(`${name}: configure URL e chave da API no painel`);
      const site = process.env.NEXT_PUBLIC_SITE_URL || "";
      const res = await fetch(`${cfg.apiUrl.replace(/\/$/, "")}/pix/charges`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.apiKey}` },
        body: JSON.stringify({
          amount: Math.round(i.amount * 100),
          external_id: i.orderId,
          description: i.description,
          expires_in: (i.expiresMinutes ?? 30) * 60,
          payer: { name: i.customer.name, email: i.customer.email, document: i.customer.document, phone: i.customer.phone },
          webhook_url: `${site}/api/webhooks/payment`,
        }),
      });
      if (!res.ok) throw new Error(`${name}: falha ao gerar Pix (${res.status}) ${await res.text()}`);
      const d = await res.json();
      return { id: String(d.id), pixCode: d.pix_code ?? d.qr_code ?? d.brcode, expiresAt: d.expires_at };
    },
    async parseWebhook(req, raw) {
      if (cfg.webhookSecret) {
        const sig = req.headers.get("x-signature") ?? "";
        const { createHmac, timingSafeEqual } = await import("node:crypto");
        const expected = createHmac("sha256", cfg.webhookSecret).update(raw).digest("hex");
        const a = Buffer.from(sig);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("assinatura inválida");
      }
      const d = JSON.parse(raw);
      const id = d.id ?? d.charge_id ?? d.data?.id;
      const status = String(d.status ?? d.data?.status ?? "").toLowerCase();
      return id ? { chargeId: String(id), paid: ["paid", "approved", "completed", "pago"].includes(status) } : null;
    },
  };
}

export async function payments(): Promise<PaymentProvider> {
  const s = await getSecrets();
  if (s.provider === "vaultic" || s.provider === "primecash") return rest(s.provider, s);
  return mock;
}
