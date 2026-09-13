/** Profile — public user data, 1:1 with the auth user. */
export interface Profile {
  id: string;
  name: string | null;
  avatar: string | null;
  phone: string | null;
  isAdmin: boolean;
  createdAt: string;
  /**
   * Last request served with a live session (throttled by the middleware).
   * Unlike auth.users.last_sign_in_at, this tracks activity, not sign-ins.
   */
  lastSeenAt: string | null;
}
