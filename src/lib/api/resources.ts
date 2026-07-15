import { apiFetch } from "./client";
import type {
  ApiEnvelope,
  Company,
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
