"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/components/analytics/analytics-provider";

interface BuyButtonProps {
  productId: string;
  plan?: "book" | "subscription";
  label?: string;
  className?: string;
}

/**
 * Starts Stripe Checkout. Sends only the productId — price is resolved
 * and validated server-side.
 */
export function BuyButton({ productId, plan = "book", label = "Comprar agora", className }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    track("checkout_started", { productId, plan });

    // Recurring plans go through Stripe in subscription mode, which is a
    // different Checkout Session — not a flag on the one-time one.
    const endpoint =
      plan === "subscription" ? "/api/checkout/subscription" : "/api/checkout";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? "Não foi possível iniciar o checkout.");
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
