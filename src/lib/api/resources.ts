import { apiFetch } from "./client";
import type {
  ApiEnvelope,
  Company,
  DeviceApp,
  DeviceCatalogPlan,
  DeviceSubscription,
  Paginated,
  Product,
  Release,
  ReleaseArtifact,
  Subscription,
} from "./types";

// --- Companies (clients) ---

export function fetchCompanies(page = 1) {
  return apiFetch<Paginated<Company>>(`/v1/companies?per_page=100&page=${page}`);
}

export function createCompany(body: {
  name: string;
  email?: string | null;
  phone?: string | null;
}) {
  return apiFetch<ApiEnvelope<Company>>("/v1/companies", { method: "POST", body });
}

export function deleteCompany(id: string) {
  return apiFetch<void>(`/v1/companies/${id}`, { method: "DELETE" });
}

// --- Products (catalog, public) ---

export function fetchProducts() {
  return apiFetch<ApiEnvelope<Product[]>>("/v1/products", { auth: false });
}

// --- Subscriptions ---

export function fetchSubscriptions(page = 1) {
  return apiFetch<Paginated<Subscription>>(
    `/v1/subscriptions?per_page=50&page=${page}`,
  );
}

export interface CreateSubscriptionBody {
  company: string;
  plan: string;
  identifier_type?: string | null;
  identifier_value?: string | null;
  auto_renew?: boolean;
}

export function createSubscription(body: CreateSubscriptionBody) {
  return apiFetch<ApiEnvelope<Subscription>>("/v1/subscriptions", {
    method: "POST",
    body,
  });
}

export function renewSubscription(id: string) {
  return apiFetch<ApiEnvelope<Subscription>>(`/v1/subscriptions/${id}/renew`, {
    method: "POST",
  });
}

export function cancelSubscription(id: string) {
  return apiFetch<ApiEnvelope<Subscription>>(`/v1/subscriptions/${id}/cancel`, {
    method: "POST",
  });
}

export function deleteSubscription(id: string) {
  return apiFetch<void>(`/v1/subscriptions/${id}`, { method: "DELETE" });
}

// --- Device subscriptions (consumer apps: SmartAgent, Fawateer) ---

export interface DeviceSubscriptionFilters {
  /** `"pending"` lists the devices waiting on an operator. */
  status?: string;
  app_name?: string;
  /** Searches device_id, full_name and phone. */
  q?: string;
  page?: number;
}

export function fetchDeviceSubscriptions(filters: DeviceSubscriptionFilters = {}) {
  const params = new URLSearchParams({ per_page: "25" });

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }

  return apiFetch<Paginated<DeviceSubscription>>(
    `/v1/device-subscriptions?${params.toString()}`,
  );
}

/**
 * Activate or extend a device. Fulfils the purchase intent, so it also closes
 * the pending request server-side and pushes the live-unlock notification.
 */
export function activateDeviceSubscription(id: string, planId: string) {
  return apiFetch<ApiEnvelope<DeviceSubscription>>(
    `/v1/device-subscriptions/${id}/activate`,
    { method: "POST", body: { plan_id: planId } },
  );
}

/**
 * Reject an open purchase intent. Closes the request without selling anything —
 * the alternative was activating a plan just to clear the queue.
 *
 * Only touches the request: a device holding a trial or a paid plan keeps it.
 * 422s if there is no pending request to decline.
 */
export function declineDeviceSubscription(id: string) {
  return apiFetch<ApiEnvelope<DeviceSubscription>>(
    `/v1/device-subscriptions/${id}/decline`,
    { method: "POST" },
  );
}

/**
 * Remove a device row: smoke-test entries, the inert `fallback_device_id`
 * bucket rows, duplicates.
 *
 * `force` is required for a device that still has access — deleting one is not
 * a tidy-up, it locks that device out of the app immediately and silently. It
 * cannot be undone; the row is the only record the device existed.
 */
export function deleteDeviceSubscription(id: string, force = false) {
  return apiFetch<void>(
    `/v1/device-subscriptions/${id}${force ? "?force=1" : ""}`,
    { method: "DELETE" },
  );
}

// --- Releases (Download Center) ---

export interface ReleaseFilters {
  product?: string;
  channel?: string;
  status?: string;
  page?: number;
}

export function fetchReleases(filters: ReleaseFilters = {}) {
  const params = new URLSearchParams({ per_page: "25" });

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }

  return apiFetch<Paginated<Release>>(`/v1/releases?${params.toString()}`);
}

export function fetchRelease(id: string) {
  return apiFetch<ApiEnvelope<Release>>(`/v1/releases/${id}`);
}

export interface CreateReleaseBody {
  /** A Products-module slug — releases belong to a product, not an app. */
  product: string;
  channel: string;
  version: string;
  name?: string | null;
  notes?: string | null;
}

export function createRelease(body: CreateReleaseBody) {
  return apiFetch<ApiEnvelope<Release>>("/v1/releases", { method: "POST", body });
}

/** 422s if the release has no artifacts — there would be nothing to download. */
export function publishRelease(id: string) {
  return apiFetch<ApiEnvelope<Release>>(`/v1/releases/${id}/publish`, {
    method: "POST",
  });
}

export function archiveRelease(id: string) {
  return apiFetch<ApiEnvelope<Release>>(`/v1/releases/${id}/archive`, {
    method: "POST",
  });
}

/** Deletes the release and every stored artifact file with it. */
export function deleteRelease(id: string) {
  return apiFetch<void>(`/v1/releases/${id}`, { method: "DELETE" });
}

/**
 * Upload a build. One artifact per platform per release — re-uploading the same
 * platform replaces the stored file rather than adding a second one.
 *
 * Extensions are restricted to real distributables: the endpoint serves files
 * from the platform's own origin, so an `.html` artifact would be script running
 * as this site.
 */
export function uploadArtifact(releaseId: string, file: File, platform: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("platform", platform);

  return apiFetch<ApiEnvelope<ReleaseArtifact>>(
    `/v1/releases/${releaseId}/artifacts`,
    { method: "POST", body: form },
  );
}

export function deleteArtifact(id: string) {
  return apiFetch<void>(`/v1/artifacts/${id}`, { method: "DELETE" });
}

/**
 * The permanent public download URL for a product's current build on a platform.
 *
 * Built client-side rather than returned by the API because it is a stable,
 * guessable address by design — it names "the latest Android build of X", not a
 * file, so it keeps working after the next release with no link to reissue. That
 * is what makes it safe to paste into a message or a cached config file, unlike
 * the 15-minute signed links used for authenticated self-update.
 */
export function publicDownloadUrl(productSlug: string, platform: string) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

  return `${base}/v1/downloads/latest/${productSlug}/${platform}`;
}

// --- Device catalog (apps + their purchasable plans) ---

export function fetchDeviceApps() {
  return apiFetch<ApiEnvelope<DeviceApp[]>>("/v1/device-apps");
}

export interface UpdateDeviceAppBody {
  label?: string;
  trial_days?: number;
  uses_shared_plans?: boolean;
  /** A Products-module slug, or null to unlink. */
  product?: string | null;

  /** Digits and dots only — a suffix reads as 0 and hides the update. */
  latest_version?: string | null;
  api_base_url?: string | null;
  /** Keyed by ABI: `arm64-v8a`, `armeabi-v7a`, `x86_64`, `x86`, `default`. */
  downloads?: Record<string, string>;
  update_notes?: string[];
  support_email?: string | null;
  support_whatsapp?: string | null;
  support_telegram?: string | null;
}

export function updateDeviceApp(id: string, body: UpdateDeviceAppBody) {
  return apiFetch<ApiEnvelope<DeviceApp>>(`/v1/device-apps/${id}`, {
    method: "PATCH",
    body,
  });
}

/**
 * The catalog for one scope. Passing an app id lists that app's own plans;
 * omitting it lists the shared catalog that the un-namespaced `/api/getPlans`
 * serves.
 *
 * Unlike {@link fetchDevicePlans}, this includes disabled plans — this is the
 * editor, and a disabled plan is what you go there to re-enable.
 */
export function fetchDeviceCatalogPlans(appId?: string | null) {
  const query = appId ? `?app=${encodeURIComponent(appId)}` : "";

  return apiFetch<ApiEnvelope<DeviceCatalogPlan[]>>(`/v1/device-plans${query}`);
}

export interface DevicePlanBody {
  key?: string;
  app?: string | null;
  title?: string;
  description?: string | null;
  duration_months?: number;
  price?: number;
  price_after_discount?: number | null;
  enabled?: boolean;
  recommended?: boolean;
  sort_order?: number;
}

export function createDevicePlan(body: DevicePlanBody) {
  return apiFetch<ApiEnvelope<DeviceCatalogPlan>>("/v1/device-plans", {
    method: "POST",
    body,
  });
}

/** `key` is immutable and silently ignored — re-keying would orphan holders. */
export function updateDevicePlan(id: string, body: DevicePlanBody) {
  return apiFetch<ApiEnvelope<DeviceCatalogPlan>>(`/v1/device-plans/${id}`, {
    method: "PATCH",
    body,
  });
}

/**
 * Refused with a 422 when any device is subscribed on the plan: deleting it
 * would resolve their next renewal to a 0-month term. There is no force flag —
 * disabling is the supported way to retire a price.
 */
export function deleteDevicePlan(id: string) {
  return apiFetch<void>(`/v1/device-plans/${id}`, { method: "DELETE" });
}

export interface DevicePlan {
  id: string;
  title: string;
  description: string | null;
  duration_months: number;
  price: number;
  price_after_discount: number | null;
  enabled: boolean;
  recommended: boolean;
}

/**
 * The same catalog the app sees, so the operator can only pick a plan id the
 * device recognises. Scope it to the device's app: plans are per-app, and an id
 * the device's catalog does not define activates a 0-month term — an instantly
 * expired subscription for someone who has just paid.
 */
export function fetchDevicePlans(appName?: string | null) {
  const query = appName ? `?app_name=${encodeURIComponent(appName)}` : "";

  return apiFetch<ApiEnvelope<{ currency: { code: string; symbol: string } | null; plans: DevicePlan[] }>>(
    `/v1/device-subscriptions/plans${query}`,
  );
}
