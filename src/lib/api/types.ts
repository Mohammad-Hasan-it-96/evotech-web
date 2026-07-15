/** Shapes returned by the EVOTECH platform API (constitution §7). */

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
  links?: Record<string, unknown>;
}

export interface ApiErrorDetail {
  field: string;
  issue: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: Record<string, string | null>;
}

/** A translatable string `{ ar, en }` (matches the API's JSON shape). */
export type LocalizedText = Record<string, string>;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string | null;
}

export interface Company {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string | null;
}

export interface Plan {
  id: string;
  name: LocalizedText;
  price: number;
  currency: string;
  billing_period: string;
  features: LocalizedText[];
  is_popular: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  icon: string;
  platforms: string[];
  is_featured: boolean;
  plans: Plan[];
}

export interface Subscription {
  id: string;
  status: string;
  identifier: { type: string; value: string | null } | null;
  starts_at: string;
  ends_at: string | null;
  auto_renew: boolean;
  price: number;
  currency: string;
  is_active: boolean;
  days_remaining: number | null;
  company: { id: string; name: string };
  plan: {
    id: string;
    name: LocalizedText;
    billing_period: string;
    product: { slug: string; name: LocalizedText };
  };
}

/** Thrown for any non-2xx API response, carrying the standard error envelope. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string = "UNKNOWN",
    public readonly details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}
