import { apiFetch } from "./client";
import type { ApiEnvelope, AuthUser } from "./types";

export function loginRequest(email: string, password: string) {
  return apiFetch<ApiEnvelope<{ user: AuthUser; token: string }>>(
    "/v1/auth/login",
    {
      method: "POST",
      body: { email, password, device_name: "dashboard" },
      auth: false,
    },
  );
}

export function fetchMe() {
  return apiFetch<ApiEnvelope<AuthUser>>("/v1/auth/me");
}

export function logoutRequest() {
  return apiFetch<void>("/v1/auth/logout", { method: "POST" });
}
