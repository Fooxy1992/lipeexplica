/**
 * NotificationGateway — fire-and-forget post-purchase notifications.
 * Implementation posts to n8n, which handles WhatsApp + Email delivery.
 * Business rules stay in Next.js; n8n only delivers messages.
 */
export interface PurchaseNotification {
  name: string | null;
  email: string;
  phone: string | null;
  product: string;
  amount: number;
  currency: string;
  paymentIntent: string | null;
  sessionId: string;
  userId: string;
  libraryUrl: string;
}

export interface NotificationGateway {
  notifyPurchase(payload: PurchaseNotification): Promise<void>;
}
