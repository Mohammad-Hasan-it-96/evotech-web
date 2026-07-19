import { getToken } from "@/lib/auth/storage";
import { ApiError } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Attach the bearer token (default true). */
  auth?: boolean;
};

/**
 * Calls the platform API and returns the parsed JSON envelope. Throws {@link ApiError}
 * (carrying the standard `{error:{code,message,details}}` shape) on any non-2xx status.
 */
export async function apiFetch<T>(
  path: string,
  { method = "GET", body, auth = true }: ApiFetchOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };

  /*
   * FormData is passed through untouched and deliberately gets no Content-Type:
   * the browser has to set it itself so it can append the multipart boundary.
   * Setting it here produces a body the server cannot parse, and the failure
   * looks like a validation error rather than a malformed request.
   */
  const isMultipart = body instanceof FormData;

  if (body !== undefined && !isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isMultipart
      ? (body as FormData)
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  if (res.status === 204) return undefined as T;

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const error = (json as { error?: { code?: string; message?: string; details?: [] } } | null)?.error;
    throw new ApiError(
      error?.message ?? "Request failed",
      res.status,
      error?.code ?? "UNKNOWN",
      error?.details ?? [],
    );
  }

  return json as T;
}
