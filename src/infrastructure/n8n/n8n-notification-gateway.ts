import type {
  NotificationGateway,
  PurchaseNotification,
} from "@/core/application/ports/notification-gateway";
import type { Logger } from "@/core/application/ports/logger";

/**
 * Posts the purchase payload to the n8n webhook. n8n is delivery-only
 * (WhatsApp + Email) — all business rules live in Next.js.
 */
export class N8nNotificationGateway implements NotificationGateway {
  constructor(
    private readonly webhookUrl: string | undefined,
    private readonly token: string | undefined,
    private readonly logger: Logger,
  ) {}

  async notifyPurchase(payload: PurchaseNotification): Promise<void> {
    if (!this.webhookUrl) {
      this.logger.warn("n8n.skipped", { reason: "N8N_PAYMENT_WEBHOOK_URL not set" });
      return;
    }

    const res = await fetch(this.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.token ? { "X-Webhook-Token": this.token } : {}),
      },
      body: JSON.stringify({
        nome: payload.name,
        email: payload.email,
        telefone: payload.phone,
        produto: payload.product,
        valor: payload.amount,
        moeda: payload.currency,
        paymentIntent: payload.paymentIntent,
        sessionId: payload.sessionId,
        userId: payload.userId,
        libraryUrl: payload.libraryUrl,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      throw new Error(`n8n respondeu ${res.status}`);
    }
  }
}
