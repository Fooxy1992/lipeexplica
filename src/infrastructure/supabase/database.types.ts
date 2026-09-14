/**
 * Row types mirroring supabase/migrations. Regenerate with
 * `supabase gen types typescript` once the project is linked, if preferred.
 */
export interface ProductRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover: string | null;
  type: "ebook" | "course" | "bundle" | "subscription" | "community";
  price: number;
  currency: string;
  stripe_price_id: string | null;
  subscription_stripe_price_id: string | null;
  subscription_price: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductPlanRow {
  id: string;
  product_id: string;
  slug: string;
  name: string;
  description: string | null;
  stripe_price_id: string;
  price: number;
  currency: string;
  billing_interval: "month" | "year";
  features: string[] | null;
  highlight: boolean;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface PurchaseRow {
  id: string;
  user_id: string;
  product_id: string;
  stripe_payment_intent: string | null;
  stripe_session_id: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "refunded" | "failed";
  created_at: string;
}

export interface ProfileRow {
  id: string;
  name: string | null;
  avatar: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}

export interface ReadingProgressRow {
  user_id: string;
  product_id: string;
  last_page: number;
  total_pages: number;
  visited: number[];
  favorites: number[];
  completed: boolean;
  last_accessed_at: string;
  open_count: number;
}

export interface RaffleRow {
  id: string;
  title: string;
  prize_name: string;
  prize_image_url: string | null;
  total_tickets: number;
  status: 'active' | 'sold_out' | 'drawing' | 'completed';
  draw_date: string | null;
  winner_ticket_id: string | null;
  created_at: string;
}

export interface RaffleTicketRow {
  id: string;
  raffle_id: string;
  ticket_number: number;
  status: 'available' | 'reserved' | 'paid';
  reserved_until: string | null;
  purchase_id: string | null;
  created_at: string;
}

export interface RafflePurchaseRow {
  id: string;
  raffle_id: string;
  stripe_session_id: string | null;
  ticket_quantity: number;
  amount_cents: number;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  confirmation_token: string;
  created_at: string;
}
