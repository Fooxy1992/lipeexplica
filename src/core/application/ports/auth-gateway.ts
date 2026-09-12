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
}
