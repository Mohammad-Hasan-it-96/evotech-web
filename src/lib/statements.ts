/**
 * Shared customer statements (evotech-core ADR 0013): the frozen snapshot a shop
 * shared from دفتر حسابات, read from `GET /api/v1/statements/{token}`.
 *
 * Never cached: a revoked or expired link must stop working immediately, and the
 * data is a third party's. Any failure — 404, network, a malformed body — reads as
 * "not available", which the page shows as an expired link.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

/** 32 random bytes, base64url, as the API mints them. */
const TOKEN = /^[A-Za-z0-9_-]{43}$/;

export interface StatementEntry {
  date: string;
  direction: "due" | "paid";
  amount: number;
  note: string | null;
}

export interface SharedStatement {
  shopName: string | null;
  customerName: string;
  currency: string;
  /** Positive = the customer owes the shop. */
  balance: number;
  totalDue: number;
  totalPaid: number;
  generatedAt: string;
  expiresAt: string;
  entries: StatementEntry[];
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function getSharedStatement(token: string): Promise<SharedStatement | null> {
  if (!TOKEN.test(token)) return null;

  try {
    const res = await fetch(`${API_URL}/v1/statements/${token}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: Record<string, unknown> };
    const d = body.data;
    if (!d || typeof d !== "object") return null;

    const entries = (Array.isArray(d.entries) ? d.entries : [])
      .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
      .map((e) => ({
        date: str(e.date),
        direction: e.direction === "paid" ? ("paid" as const) : ("due" as const),
        amount: num(e.amount),
        note: typeof e.note === "string" && e.note.trim() ? e.note : null,
      }));

    return {
      shopName: typeof d.shop_name === "string" && d.shop_name.trim() ? d.shop_name : null,
      customerName: str(d.customer_name),
      currency: str(d.currency),
      balance: num(d.balance),
      totalDue: num(d.total_due),
      totalPaid: num(d.total_paid),
      generatedAt: str(d.generated_at),
      expiresAt: str(d.expires_at),
      entries,
    };
  } catch {
    return null;
  }
}
