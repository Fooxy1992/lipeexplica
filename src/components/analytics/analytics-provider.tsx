"use client";

import { useEffect } from "react";
import Script from "next/script";
import posthog from "posthog-js";
import { publicEnv } from "@/lib/env";

/**
 * Analytics bootstrap: PostHog (product analytics) + Google Analytics.
 * Both are no-ops until their env vars are set. Stripe events are tracked
 * server-side through the webhook (source of truth for revenue).
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (publicEnv.NEXT_PUBLIC_POSTHOG_KEY && !posthog.__loaded) {
      posthog.init(publicEnv.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host:
          publicEnv.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        capture_pageview: true,
        persistence: "localStorage+cookie",
      });
    }
  }, []);

  const gaId = publicEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');`}
          </Script>
        </>
      ) : null}
      {children}
    </>
  );
}

/** Track a client-side event on every configured provider. */
export function track(event: string, props?: Record<string, unknown>) {
  if (publicEnv.NEXT_PUBLIC_POSTHOG_KEY) posthog.capture(event, props);
  if (
    publicEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID &&
    typeof window !== "undefined" &&
    "gtag" in window
  ) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      "event",
      event,
      props ?? {},
    );
  }
}
