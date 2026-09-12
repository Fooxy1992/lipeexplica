/** Profile — public user data, 1:1 with the auth user. */
export interface Profile {
  id: string;
  name: string | null;
  avatar: string | null;
  phone: string | null;
  isAdmin: boolean;
  createdAt: string;
}
