import type { LocalizedText } from "@/content/types";
import { catalogFallback } from "@/content/catalog-fallback";

export interface CatalogPlan {
  id: string;
  name: LocalizedText;
  price: number;
  currency: string;
  billingPeriod: string;
  features: LocalizedText[];
  isPopular: boolean;
}

export interface CatalogProduct {
  slug: string;
  icon: string;
  name: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  platforms: string[];
  featured: boolean;
  plans: CatalogPlan[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const EMPTY: LocalizedText = { ar: "", en: "" };

interface ApiPlan {
  id: string;
  name: LocalizedText;
  price: number;
  currency: string;
  billing_period: string;
  features: LocalizedText[] | null;
  is_popular: boolean;
}

interface ApiProduct {
  slug: string;
  icon: string;
  name: LocalizedText;
  tagline: LocalizedText | null;
  description: LocalizedText | null;
  platforms: string[] | null;
  is_featured: boolean;
  plans: ApiPlan[];
}

function mapProduct(p: ApiProduct): CatalogProduct {
  return {
    slug: p.slug,
    icon: p.icon,
    name: p.name,
    tagline: p.tagline ?? EMPTY,
    description: p.description ?? EMPTY,
    platforms: p.platforms ?? [],
    featured: p.is_featured,
    plans: p.plans.map((pl) => ({
      id: pl.id,
      name: pl.name,
      price: pl.price,
      currency: pl.currency,
      billingPeriod: pl.billing_period,
      features: pl.features ?? [],
      isPopular: pl.is_popular,
    })),
  };
}

/**
 * The product catalog — the API is the single source of truth. Falls back to the
 * local snapshot if the API is unreachable, so the marketing site always renders.
 * Revalidated every 5 minutes (ISR).
 */
export async function getCatalog(): Promise<CatalogProduct[]> {
  try {
    const res = await fetch(`${API_URL}/v1/products`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Products API returned ${res.status}`);
    const json = (await res.json()) as { data: ApiProduct[] };
    return json.data.map(mapProduct);
  } catch {
    return catalogFallback;
  }
}

export async function getFeaturedProducts(): Promise<CatalogProduct[]> {
  return (await getCatalog()).filter((p) => p.featured);
}

export async function getProduct(
  slug: string,
): Promise<CatalogProduct | undefined> {
  return (await getCatalog()).find((p) => p.slug === slug);
}
