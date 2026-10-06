import type { LocalizedText } from "./types";

/**
 * Catalog products that are installable device apps sold through the
 * DeviceSubscriptions module. Their prices are **device plans** (`getPlans` on the
 * app's `/api/{slug}` namespace), not the company plans on the Products catalog, so
 * the product and pricing pages render them from here instead.
 */
export interface DeviceApp {
  /** The Products catalog slug (`/products/{productSlug}`). */
  productSlug: string;
  /** The DeviceSubscriptions namespace: `/api/{apiSlug}/getPlans`, `/remote-config`. */
  apiSlug: string;
  /** `/privacy/{privacySlug}`. */
  privacySlug: string;
  trialDays: number;
  free: LocalizedText[];
  pro: LocalizedText[];
  payment: LocalizedText;
}

export const deviceApps: DeviceApp[] = [
  {
    productSlug: "ledger",
    apiSlug: "daftar",
    privacySlug: "daftar",
    trialDays: 14,
    free: [
      { ar: "زبائن وحركات بلا حدود", en: "Unlimited customers and transactions" },
      { ar: "رصيد كل زبون فوراً، وكشف حساب مفصّل", en: "Every balance instantly, with a detailed statement" },
      { ar: "دفتر لليرة ودفتر للدولار", en: "Separate books for lira and dollar" },
      { ar: "كشف حساب PDF أو نصّي للزبون", en: "PDF or text statements for customers" },
      { ar: "نسخة احتياطية يومية على جهازك", en: "Daily backup on your device" },
      { ar: "قفل برمز PIN أو بالبصمة", en: "PIN or fingerprint lock" },
      { ar: "يعمل بلا إنترنت — بياناتك على هاتفك", en: "Works offline — your data stays on your phone" },
    ],
    pro: [
      { ar: "تذكير الزبون بدَينه عبر واتساب", en: "WhatsApp debt reminders" },
      { ar: "تذكير المتأخرين دفعة واحدة", en: "Remind all overdue customers in one go" },
      { ar: "نسخ احتياطي إلى Google Drive واسترجاع على جهاز جديد", en: "Google Drive backup and restore on a new phone" },
      { ar: "تحويل الأرصدة إلى الليرة الجديدة (100:1)", en: "Convert balances to the new lira (100:1)" },
      { ar: "كشوف ورسائل بلا تذييل التطبيق", en: "Statements and messages without the app footer" },
    ],
    payment: {
      ar: "الدفع خارج التطبيق: شام كاش، سيريتل كاش، MTN كاش، أو نقداً لمندوب. تطلب الخطة من التطبيق ونفعّلها لك.",
      en: "Paid outside the app: Sham Cash, Syriatel Cash, MTN Cash, or cash to a rep. Request a plan in the app and we activate it.",
    },
  },
];

export function getDeviceApp(productSlug: string): DeviceApp | undefined {
  return deviceApps.find((a) => a.productSlug === productSlug);
}
