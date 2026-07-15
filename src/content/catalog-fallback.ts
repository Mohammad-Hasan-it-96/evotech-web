import type { CatalogProduct } from "@/lib/catalog";

/**
 * Fallback catalog used when the Products API is unreachable (e.g. during a build
 * with the API down). Mirrors the API's ProductCatalogSeeder so the marketing site
 * always renders. The API is the source of truth when available.
 */
export const catalogFallback: CatalogProduct[] = [
  {
    slug: "smart-delegate",
    icon: "truck",
    featured: true,
    name: { ar: "المندوب الذكي", en: "Smart Delegate" },
    tagline: {
      ar: "إدارة المندوبين والتحصيل ميدانياً",
      en: "Field sales & collection, managed",
    },
    description: {
      ar: "تطبيق يُدير المندوبين والطلبات والتحصيل في الميدان مع تتبّع فوري وتقارير دقيقة.",
      en: "Manage field reps, orders and collections with live tracking and accurate reports.",
    },
    platforms: ["Android", "iOS"],
    plans: [
      { id: "smart-delegate-basic", name: { ar: "الأساسية", en: "Basic" }, price: 29, currency: "USD", billingPeriod: "monthly", isPopular: false, features: [{ ar: "حتى 3 مندوبين", en: "Up to 3 reps" }] },
      { id: "smart-delegate-pro", name: { ar: "الاحترافية", en: "Pro" }, price: 79, currency: "USD", billingPeriod: "monthly", isPopular: true, features: [{ ar: "مندوبون غير محدودين", en: "Unlimited reps" }, { ar: "تقارير متقدمة", en: "Advanced reports" }] },
    ],
  },
  {
    slug: "invoices",
    icon: "receipt",
    featured: true,
    name: { ar: "فواتير", en: "Invoices" },
    tagline: { ar: "فوترة احترافية بلمسة زر", en: "Professional invoicing in a tap" },
    description: {
      ar: "أنشئ فواتير وعروض أسعار احترافية وتابع المدفوعات والذمم.",
      en: "Create professional invoices and quotes, track payments and receivables.",
    },
    platforms: ["Android", "iOS", "Web"],
    plans: [
      { id: "invoices-basic", name: { ar: "الأساسية", en: "Basic" }, price: 19, currency: "USD", billingPeriod: "monthly", isPopular: false, features: [{ ar: "حتى 100 فاتورة/شهر", en: "Up to 100 invoices/mo" }] },
      { id: "invoices-pro", name: { ar: "الاحترافية", en: "Pro" }, price: 49, currency: "USD", billingPeriod: "monthly", isPopular: true, features: [{ ar: "فواتير غير محدودة", en: "Unlimited invoices" }, { ar: "ضرائب وخصومات", en: "Taxes & discounts" }] },
    ],
  },
  {
    slug: "ledger",
    icon: "book",
    featured: true,
    name: { ar: "دفتر الحسابات", en: "Ledger" },
    tagline: { ar: "دفتر حساباتك في جيبك", en: "Your accounts, in your pocket" },
    description: {
      ar: "سجّل المقبوضات والمدفوعات وتابع أرصدة العملاء والموردين.",
      en: "Record income and expenses, track customer and supplier balances.",
    },
    platforms: ["Android", "iOS"],
    plans: [
      { id: "ledger-basic", name: { ar: "الأساسية", en: "Basic" }, price: 15, currency: "USD", billingPeriod: "monthly", isPopular: false, features: [{ ar: "حساب واحد", en: "1 account" }] },
      { id: "ledger-pro", name: { ar: "الاحترافية", en: "Pro" }, price: 39, currency: "USD", billingPeriod: "monthly", isPopular: true, features: [{ ar: "حسابات متعددة", en: "Multiple accounts" }, { ar: "تقارير شهرية", en: "Monthly reports" }] },
    ],
  },
  {
    slug: "restaurant",
    icon: "utensils",
    featured: true,
    name: { ar: "نظام المطاعم", en: "Restaurant Suite" },
    tagline: { ar: "منيو + لوحة طلبات + تطبيق", en: "Menu + orders dashboard + app" },
    description: {
      ar: "نظام متكامل للمطاعم: منيو رقمي، لوحة طلبات لحظية، وتطبيق للعملاء.",
      en: "A complete restaurant system: digital menu, real-time orders board, and a customer app.",
    },
    platforms: ["Web", "Android", "iOS"],
    plans: [
      { id: "restaurant-basic", name: { ar: "الأساسية", en: "Basic" }, price: 49, currency: "USD", billingPeriod: "monthly", isPopular: false, features: [{ ar: "فرع واحد", en: "1 branch" }] },
      { id: "restaurant-pro", name: { ar: "الاحترافية", en: "Pro" }, price: 99, currency: "USD", billingPeriod: "monthly", isPopular: true, features: [{ ar: "فروع متعددة", en: "Multiple branches" }, { ar: "تطبيق عملاء", en: "Customer app" }] },
    ],
  },
  {
    slug: "pharmacy-warehouse",
    icon: "pill",
    featured: false,
    name: { ar: "مستودعات الأدوية", en: "Pharma Warehouse" },
    tagline: { ar: "إدارة مستودعات الأدوية بدقة", en: "Precise pharmaceutical warehousing" },
    description: {
      ar: "تتبّع الدفعات وتواريخ الصلاحية وإدارة المخزون وتطبيق جرد وتوزيع.",
      en: "Batch & expiry tracking, inventory management, and a field stock-taking app.",
    },
    platforms: ["Web", "Android"],
    plans: [
      { id: "pharmacy-warehouse-basic", name: { ar: "الأساسية", en: "Basic" }, price: 89, currency: "USD", billingPeriod: "monthly", isPopular: false, features: [{ ar: "مستودع واحد", en: "1 warehouse" }] },
      { id: "pharmacy-warehouse-pro", name: { ar: "الاحترافية", en: "Pro" }, price: 199, currency: "USD", billingPeriod: "monthly", isPopular: true, features: [{ ar: "مستودعات متعددة", en: "Multiple warehouses" }, { ar: "تنبيهات صلاحية", en: "Expiry alerts" }] },
    ],
  },
];
