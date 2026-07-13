import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/infrastructure/supabase/server";
import { SupabaseProductRepository } from "@/infrastructure/repositories/supabase-product-repository";
import { SupabasePurchaseRepository } from "@/infrastructure/repositories/supabase-purchase-repository";
import { SupabaseProfileRepository } from "@/infrastructure/repositories/supabase-profile-repository";
import { SupabaseProgressRepository } from "@/infrastructure/repositories/supabase-progress-repository";
import { SupabaseSubscriptionRepository } from "@/infrastructure/repositories/supabase-subscription-repository";
import { SupabasePreviewAccessRepository } from "@/infrastructure/repositories/supabase-preview-access-repository";
import { SupabaseBookPageRepository } from "@/infrastructure/repositories/supabase-book-page-repository";
import { SupabaseAuthGateway } from "@/infrastructure/supabase/supabase-auth-gateway";
import { StripePaymentGateway } from "@/infrastructure/stripe/stripe-payment-gateway";
import { getStripe } from "@/infrastructure/stripe/stripe-client";
import { N8nNotificationGateway } from "@/infrastructure/n8n/n8n-notification-gateway";
import { ConsoleLogger } from "@/infrastructure/logging/console-logger";
import { CreateCheckoutSession } from "@/core/application/use-cases/create-checkout-session";
import { HandleCheckoutCompleted } from "@/core/application/use-cases/handle-checkout-completed";
import { GetUserLibrary } from "@/core/application/use-cases/get-user-library";
import { GetBookAccess } from "@/core/application/use-cases/get-book-access";
import { SaveReadingProgress } from "@/core/application/use-cases/save-reading-progress";
import { publicEnv, serverEnv } from "@/lib/env";

/**
 * Composition root. Two flavors:
 *
 * - `userScopedContainer()` — repositories run through the request-bound
 *   client (RLS enforced as the logged-in user). For pages/user APIs.
 * - `adminContainer()`      — service-role client (bypasses RLS). ONLY for
 *   the Stripe webhook and admin operations.
 */

export const logger = new ConsoleLogger({ app: "lipeexplica" });

function buildRepos(db: SupabaseClient) {
  return {
    products: new SupabaseProductRepository(db),
    purchases: new SupabasePurchaseRepository(db),
    profiles: new SupabaseProfileRepository(db),
    progress: new SupabaseProgressRepository(db),
    subscriptions: new SupabaseSubscriptionRepository(db),
    previewAccess: new SupabasePreviewAccessRepository(db),
    bookPages: new SupabaseBookPageRepository(db),
  };
}

export async function userScopedContainer() {
  const db = await createSupabaseServerClient();
  const repos = buildRepos(db);
  return {
    db,
    ...repos,
    getUserLibrary: new GetUserLibrary(
      repos.products,
      repos.purchases,
      repos.progress,
      repos.subscriptions,
      repos.previewAccess,
    ),
    getBookAccess: new GetBookAccess(
      repos.products,
      repos.purchases,
      repos.progress,
      repos.profiles,
      repos.subscriptions,
      repos.bookPages,
      repos.previewAccess,
    ),
    saveReadingProgress: new SaveReadingProgress(
      repos.purchases,
      repos.progress,
      repos.profiles,
    ),
    // Lazy: only /api/checkout touches Stripe. Pages that never sell
    // (landing, library, book) must not require Stripe secrets to render.
    get createCheckoutSession() {
      return new CreateCheckoutSession(
        repos.products,
        new StripePaymentGateway(getStripe()),
        logger,
      );
    },
  };
}

export function adminContainer() {
  const db = createSupabaseAdminClient();
  const repos = buildRepos(db);
  const env = serverEnv();
  return {
    db,
    ...repos,
    // Lazy: só instanciado quando um estorno é executado
    get payments() {
      return new StripePaymentGateway(getStripe());
    },
    handleCheckoutCompleted: new HandleCheckoutCompleted(
      repos.products,
      repos.purchases,
      repos.profiles,
      new SupabaseAuthGateway(db),
      new N8nNotificationGateway(
        env.N8N_PAYMENT_WEBHOOK_URL,
        env.N8N_WEBHOOK_TOKEN,
        logger,
      ),
      logger,
      publicEnv.NEXT_PUBLIC_SITE_URL,
    ),
  };
}
