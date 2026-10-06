/**
 * Live data for device apps from the DeviceSubscriptions shim on the platform API:
 * the plan catalog (`/api/{slug}/getPlans`) and the download links
 * (`/api/{slug}/remote-config`). Both shapes are the app contract
 * (evotech-core docs/api/fawateer-device-contract.md §2.5 and §9).
 *
 * Revalidated every 5 minutes like the catalog. Any failure degrades to "no plans"
 * / "no download", which the UI handles; the marketing site never breaks on it.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const REVALIDATE_SECONDS = 300;

export interface DevicePlan {
  id: string;
  title: string;
  description: string;
  durationMonths: number;
  price: number;
  priceAfterDiscount: number | null;
  recommended: boolean;
}

export interface DevicePlanCatalog {
  currencySymbol: string;
  plans: DevicePlan[];
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function getDevicePlans(apiSlug: string): Promise<DevicePlanCatalog> {
  try {
    const res = await fetch(`${API_URL}/${apiSlug}/getPlans`, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`getPlans returned ${res.status}`);
    const body = (await res.json()) as {
      currency?: { symbol?: string; code?: string };
      plans?: Record<string, unknown>[];
    };
    const plans = (body.plans ?? [])
      .filter((p) => p.enabled !== false && p.enabled !== 0)
      .map((p) => ({
        id: String(p.id ?? ""),
        title: String(p.title ?? ""),
        description: String(p.description ?? ""),
        durationMonths: num(p.duration_months),
        price: num(p.price),
        priceAfterDiscount:
          p.price_after_discount === null || p.price_after_discount === undefined
            ? null
            : num(p.price_after_discount),
        recommended: p.recommended === true || p.recommended === 1,
      }))
      .filter((p) => p.id !== "" && p.durationMonths > 0);
    return {
      currencySymbol: body.currency?.symbol || body.currency?.code || "$",
      plans,
    };
  } catch {
    return { currencySymbol: "$", plans: [] };
  }
}

export interface DeviceDownload {
  /** The universal (`default`) APK, else the first available link; null when none is published. */
  url: string | null;
  version: string | null;
  supportWhatsApp: string | null;
}

export async function getDeviceDownload(apiSlug: string): Promise<DeviceDownload> {
  try {
    const res = await fetch(`${API_URL}/${apiSlug}/remote-config`, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`remote-config returned ${res.status}`);
    const body = (await res.json()) as {
      latest_version?: string;
      downloads?: Record<string, string> | unknown[];
      support?: { whatsapp?: string };
    };
    const downloads =
      body.downloads && !Array.isArray(body.downloads) ? body.downloads : {};
    const url =
      downloads.default || Object.values(downloads).find((u) => typeof u === "string" && u) || null;
    return {
      url: url && url.startsWith("https://") ? url : null,
      version: body.latest_version || null,
      supportWhatsApp: body.support?.whatsapp?.replace(/\D/g, "") || null,
    };
  } catch {
    return { url: null, version: null, supportWhatsApp: null };
  }
}
