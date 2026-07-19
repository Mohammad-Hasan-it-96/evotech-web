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

/**
 * A consumer app's device-keyed subscription (SmartAgent, Fawateer).
 *
 * Distinct from `Subscription`, whose subscriber is a Company: here the
 * subscriber is the device itself, there is no tenant, and `plan_id` is a plain
 * string against a config catalog rather than a Plan record.
 */
export interface DeviceSubscription {
  id: string;
  app_name: string | null;
  device_id: string | null;
  full_name: string | null;
  phone: string | null;
  is_verified: boolean;
  is_active: boolean;
  is_trial: boolean;
  plan_id: string | null;
  expires_at: string | null;
  trial_expires_at: string | null;
  /** An open purchase intent filed from the app; `"pending"` is the work queue. */
  status: string | null;
  requested_plan: string | null;
  /** How the user asked to be reached: whatsapp | telegram | email. */
  contact_method: string | null;
  stars: number | null;
  comment: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * A shipped consumer app and its selling terms.
 *
 * `name` and `slug` are read-only: `name` is the literal string the shipped builds
 * send as `app_name` and every device row is matched on it, and `slug` is the base
 * URL those builds are pointed at. The API rejects changes to both.
 */
export interface DeviceApp {
  id: string;
  name: string;
  slug: string;
  label: string;
  trial_days: number;
  /** False = this app sells its own catalog; true = it reads the shared list. */
  uses_shared_plans: boolean;
  plans_count?: number;

  /**
   * The startup config served at `/config/<slug>.json`.
   *
   * `latest_version` must be digits and dots only — the apps compare it
   * component-wise as integers, so a suffix like `-beta` reads as 0 and hides the
   * update. `api_base_url` is null when derived from the slug.
   */
  latest_version: string | null;
  api_base_url: string | null;
  downloads: Record<string, string>;
  update_notes: string[];
  support_email: string | null;
  support_whatsapp: string | null;
  support_telegram: string | null;
}

/**
 * A purchasable plan in the device catalog — the admin view, including disabled
 * plans. Distinct from `Plan`, which is the Products module's platform plan.
 */
export interface DeviceCatalogPlan {
  /** The uuid; addresses this row for editing. */
  id: string;
  /**
   * The plan key the app sends back and `DeviceSubscription.plan_id` stores.
   * Immutable, and what an activation must be sent — never `id`.
   */
  key: string;
  is_shared: boolean;
  title: string;
  description: string | null;
  duration_months: number;
  price: number;
  price_after_discount: number | null;
  enabled: boolean;
  recommended: boolean;
  sort_order: number;
}

/** One platform's build within a release. */
export interface ReleaseArtifact {
  id: string;
  platform: string;
  filename: string;
  size: number;
  checksum_sha256: string;
  content_type: string | null;
  download_count: number;
  created_at: string | null;
}

/**
 * A versioned product release (Download Center).
 *
 * `status` is `draft` until published; only a published release is reachable by
 * products self-updating or by the permanent public download URL. A release
 * cannot be published without at least one artifact.
 */
export interface Release {
  id: string;
  version: string;
  channel: string;
  name: string | null;
  notes: string | null;
  status: string;
  published_at: string | null;
  created_at: string | null;
  artifacts_count?: number;
  artifacts?: ReleaseArtifact[];
  product: { slug: string; name: LocalizedText };
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
