import type { Locale } from "@/i18n/routing";

/** A string available in every supported locale. */
export type LocalizedText = Record<Locale, string>;

/** Resolve a localized field for the active locale. */
export function localized(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.ar;
}

export interface Product {
  slug: string;
  /** Icon name resolved by <Icon />. */
  icon: string;
  name: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  features: LocalizedText[];
  /** Platform labels (not localized). */
  platforms: string[];
  featured?: boolean;
}

export interface Service {
  slug: string;
  icon: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface PricingPlan {
  slug: string;
  name: LocalizedText;
  /** Placeholder price. `null` = custom / contact us. */
  price: number | null;
  currency: string;
  description: LocalizedText;
  features: LocalizedText[];
  popular?: boolean;
}
