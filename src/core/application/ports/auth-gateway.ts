/**
 * AuthGateway — admin-level auth operations used by server-side use cases
 * (e.g. creating the buyer account from the Stripe webhook).
 */
export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthGateway {
  /** Find a user by email or create one (email pre-confirmed). */
  findOrCreateUserByEmail(
    email: string,
    metadata?: { name?: string; phone?: string },
  ): Promise<AuthUser>;

  /**
   * Emails the buyer a one-click access link (Supabase magic link, branded
   * template). Used right after payment so access does not depend on the
   * buyer remembering to request a login link.
   */
  sendAccessLink(email: string, next?: string): Promise<void>;
}
