import type { LocalizedText } from "@/lib/api/types";

/** Pick the active-locale value from a translatable API field, falling back to ar. */
export function pickText(text: LocalizedText, locale: string): string {
  return text[locale] ?? text.ar ?? Object.values(text)[0] ?? "";
}

/** Badge variant for a subscription/company/product status. */
export function statusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "pending":
      return "secondary";
    case "expired":
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}
