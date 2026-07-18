import { apiFetch } from "./client";
import type {
  ApiEnvelope,
  Company,
  DeviceSubscription,
  Paginated,
  Product,
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
