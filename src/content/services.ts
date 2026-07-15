import type { Service } from "./types";

export const services: Service[] = [
  {
    slug: "web",
    icon: "globe",
    title: { ar: "تطبيقات الويب", en: "Web Applications" },
    description: {
      ar: "منصّات ولوحات تحكم سريعة وآمنة مبنية بأحدث التقنيات.",
      en: "Fast, secure platforms and dashboards built with modern tech.",
    },
  },
  {
    slug: "mobile",
    icon: "smartphone",
    title: { ar: "تطبيقات الموبايل", en: "Mobile Apps" },
    description: {
      ar: "تطبيقات أندرويد وiOS بأداءٍ أصيل وتجربةٍ سلسة.",
      en: "Android & iOS apps with native performance and a smooth UX.",
    },
  },
  {
    slug: "erp-pos",
    icon: "boxes",
    title: { ar: "أنظمة ERP و POS", en: "ERP & POS Systems" },
    description: {
      ar: "أنظمة متكاملة لإدارة الموارد ونقاط البيع للمطاعم والمتاجر.",
      en: "Integrated resource-planning and point-of-sale systems for restaurants and retail.",
    },
  },
  {
    slug: "uiux",
    icon: "palette",
    title: { ar: "تصميم واجهات UI/UX", en: "UI/UX Design" },
    description: {
      ar: "واجهات أنيقة ومدروسة تركّز على المستخدم وسهولة الاستخدام.",
      en: "Elegant, thoughtful interfaces focused on the user and usability.",
    },
  },
  {
    slug: "cloud",
    icon: "cloud",
    title: { ar: "الاستضافة والحلول السحابية", en: "Cloud & DevOps" },
    description: {
      ar: "نشر وإدارة ومراقبة موثوقة لأنظمتك على خوادم آمنة.",
      en: "Reliable deployment, management and monitoring on secure servers.",
    },
  },
  {
    slug: "support",
    icon: "lifebuoy",
    title: { ar: "الصيانة والدعم", en: "Maintenance & Support" },
    description: {
      ar: "دعمٌ فني متواصل وتطويرٌ مستمر بعد الإطلاق.",
      en: "Continuous technical support and improvement after launch.",
    },
  },
];
