import { payments } from "@/lib/payments";
import { markPaidByCharge } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const raw = await req.text();
  try {
    const provider = await payments();
    if (provider.name === "mock") return new Response("mock não aceita webhook externo", { status: 403 });
    const evt = await provider.parseWebhook(req, raw);
    if (evt?.paid) await markPaidByCharge(evt.chargeId);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("webhook", e);
    return new Response("invalid", { status: 400 });
  }
}
