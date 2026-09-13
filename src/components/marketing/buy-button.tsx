"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/components/analytics/analytics-provider";

interface BuyButtonProps {
  productId: string;
  /** Which tier to subscribe to. The price is resolved server-side. */
  planSlug: string;
  label?: string;
  className?: string;
}

/**
 * Starts Stripe Checkout in subscription mode. Sends only the product and the
 * plan slug — the amount is never trusted from the browser.
 */
export function BuyButton({
  productId,
  planSlug,
  label = "Assinar agora",
  className,
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    track("checkout_started", { productId, plan: planSlug });

    try {
      const res = await fetch("/api/checkout/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, planSlug }),
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? "Não foi possível iniciar a assinatura.");
        setLoading(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="gold"
        size="lg"
        onClick={handleClick}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShoppingBag className="h-4 w-4" />
        )}
        {loading ? "Redirecionando..." : label}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
