import type { LocalizedText } from "./types";

/**
 * Per-product privacy policies, served at /{locale}/privacy/{product}.
 *
 * Each policy is the store-linked one for that app (Google Play requires a public
 * URL). Its text must match what the app actually does and the in-app policy
 * screen. The source of truth for دفتر حسابات is
 * Accounting-Book/docs/store/privacy-policy.md — change both together.
 */
export interface PrivacySection {
  title: LocalizedText;
  paragraphs?: LocalizedText[];
  bullets?: LocalizedText[];
}

export interface PrivacyPolicy {
  /** URL segment: /privacy/{product}. */
  product: string;
  productName: LocalizedText;
  /** ISO date of the last change. */
  updated: string;
  contact: { email: string; whatsapp: string };
  sections: PrivacySection[];
}

const daftar: PrivacyPolicy = {
  product: "daftar",
  productName: { ar: "دفتر حسابات", en: "Daftar Hesabat" },
  updated: "2026-10-07",
  contact: { email: "mohamad.hasan.it.96@gmail.com", whatsapp: "963983820430" },
  sections: [
    {
      title: { ar: "باختصار", en: "Summary" },
      paragraphs: [
        {
          ar: "«دفتر حسابات» دفتر ديون رقمي للمحلات. دفترك — عملاؤك ومبالغهم وحركاتهم — يبقى على هاتفك، لا نراه ولا نستضيفه على خوادمنا إلا كشفاً تختار أنت مشاركته كرابط. نرسل إلى خادمنا فقط ما يلزم لإدارة اشتراكك. لا نبيع أي بيانات ولا نعرض إعلانات.",
          en: "Daftar Hesabat is a debt notebook for shops. Your ledger — customers, amounts and transactions — stays on your phone; we never receive or host it, except a statement you choose to share as a link. We send to our server only what is needed to manage your subscription. We sell no data and show no ads.",
        },
      ],
    },
    {
      title: { ar: "ما يبقى على جهازك فقط", en: "What stays on your device only" },
      bullets: [
        {
          ar: "العملاء: الأسماء وأرقام الهواتف والملاحظات والمجموعات.",
          en: "Customers: names, phone numbers, notes and groups.",
        },
        {
          ar: "الحركات المالية: المبالغ والتواريخ والملاحظات والعملات.",
          en: "Transactions: amounts, dates, notes and currencies.",
        },
        {
          ar: "إعداداتك: اسم المتجر، قالب رسالة التذكير، ورمز القفل (يُحفَظ مُجزّأً في التخزين الآمن للنظام).",
          en: "Your settings: shop name, reminder template, and the PIN (stored hashed in the system's secure storage).",
        },
      ],
    },
    {
      title: { ar: "ما يُرسَل إلى خادمنا", en: "What is sent to our server" },
      bullets: [
        {
          ar: "بصمة SHA-256 غير قابلة للعكس لمعرّف جهازك (لا المعرّف نفسه) — لربط اشتراكك بجهازك.",
          en: "A one-way SHA-256 fingerprint of your device ID (not the ID itself) — to link your subscription to your device.",
        },
        {
          ar: "اسمك ورقم هاتفك — فقط إن سجّلت لبدء التجربة أو طلبت خطة.",
          en: "Your name and phone number — only if you register for the trial or request a plan.",
        },
        {
          ar: "الخطة المطلوبة وطريقة التواصل (واتساب/تيليغرام/بريد) — عند «اطلب الاشتراك».",
          en: "The requested plan and contact method (WhatsApp/Telegram/email) — when you request a subscription.",
        },
        {
          ar: "بريد حساب Google المرتبط بالنسخ الاحتياطي — فقط إن ربطت Google Drive، ويُحذَف عند تسجيل الخروج.",
          en: "The Google account email used for backups — only if you connect Google Drive; cleared when you sign out.",
        },
        {
          ar: "رمز الدعوة وأيّ جهاز دعاك — فقط إن أدخلت رمز دعوة، لنمنح من دعاك شهراً مجانياً عند اشتراكك.",
          en: "The invite code you entered and which device invited you — only if you enter one, so the shop that invited you gets its free month when you subscribe.",
        },
      ],
      paragraphs: [
        {
          ar: "تُستخدم هذه البيانات لإدارة الاشتراك والدعم فقط، ولا تُشارَك مع أحد إلا مزوّدي الاستضافة الذين يشغّلون خدمتنا. يفحص التطبيق أيضاً ملف إعدادات عامّاً من evotech-sys.com لمعرفة عنوان الخادم والتحديثات، دون إرسال أي بيانات منك.",
          en: "This data is used only for subscription management and support, and is shared only with the hosting providers that run our service. The app also downloads a public configuration file from evotech-sys.com (server address, updates); this sends no personal data.",
        },
      ],
    },
    {
      title: { ar: "النسخ الاحتياطي", en: "Backups" },
      bullets: [
        {
          ar: "محلياً: نسخة يومية على جهازك (اختيارية)، ويمكنك تصدير ملف ومشاركته بنفسك.",
          en: "Locally: an optional daily backup on your device; you can also export a file and share it yourself.",
        },
        {
          ar: "Google Drive (اختياري، ميزة Pro): تُرفَع النسخة إلى حسابك أنت في Google Drive، في مجلّد «Daftar Hesabat Backups». نستخدم صلاحية drive.file، أي أن التطبيق لا يرى في Drive إلا الملفات التي أنشأها هو. نحن لا نصل إلى هذه النسخ؛ هي ملك حسابك وتخضع لسياسة خصوصية Google.",
          en: "Google Drive (optional, Pro): backups are uploaded to your own Google Drive, in the «Daftar Hesabat Backups» folder, using the drive.file scope — the app sees only files it created. We have no access to these backups; they belong to your account and are governed by Google's privacy policy.",
        },
      ],
    },
    {
      title: { ar: "ما تشاركه أنت", en: "What you share" },
      paragraphs: [
        {
          ar: "تذكيرات واتساب وكشوف الحساب (نصّاً أو PDF) لا تُرسَل إلا حين تضغط أنت زر الإرسال أو المشاركة، عبر التطبيق الذي تختاره. تتضمّن اسم العميل ورصيده واسم متجرك، وتذييلاً باسم التطبيق ورابط تنزيله (يمكن إزالته في Pro).",
          en: "WhatsApp reminders and account statements (text or PDF) are sent only when you tap send or share, through the app you choose. They contain the customer's name and balance, your shop name, and a footer with the app name and download link (removable on Pro).",
        },
        {
          ar: "رابط الكشف (اختياري): حين تختار «مشاركة رابط الكشف» نرفع إلى خادمنا نسخة ثابتة من ذلك الكشف وحده — اسم المتجر واسم العميل والعملة والرصيد والحركات وملاحظاتها، دون أي رقم هاتف. يفتحها من يملك الرابط، وتُحذف تلقائياً بعد 30 يوماً، ويمكنك إيقافها قبل ذلك من الإعدادات ← روابط الكشوف المشتركة.",
          en: "Statement links (optional): when you choose “Share statement link”, we upload a fixed copy of that one statement — shop name, customer name, currency, balance, and its transactions with their notes, without any phone number. Anyone with the link can open it; it is deleted automatically after 30 days, and you can turn it off sooner from Settings → Shared statement links.",
        },
      ],
    },
    {
      title: { ar: "تقارير الأعطال", en: "Crash reports" },
      paragraphs: [
        {
          ar: "عند حدوث عطل قد يرسل التطبيق تقريراً تقنياً إلى خدمة Sentry: نوع الخطأ، ومكانه في الشيفرة، وطراز الجهاز، وإصدار النظام والتطبيق. لا يتضمّن التقرير بيانات عملائك ولا اسمك ولا رقمك. كما يُحفَظ سجلّ أعطال محلّي محدود الحجم على جهازك.",
          en: "On a crash, the app may send a technical report to Sentry: the error, its location in the code, the device model, and the OS and app versions. It contains no ledger data, name or phone number. A size-capped crash log is also kept on your device.",
        },
      ],
    },
    {
      title: { ar: "الأمان", en: "Security" },
      bullets: [
        {
          ar: "كل الاتصالات مشفّرة (HTTPS)، والاتصال غير المشفّر ممنوع في التطبيق.",
          en: "All connections are encrypted (HTTPS); unencrypted traffic is forbidden in the app.",
        },
        {
          ar: "قفل اختياري برمز PIN أو بالبصمة، مع إيقاف مؤقّت بعد 5 محاولات خاطئة.",
          en: "An optional PIN or biometric lock, with a temporary lockout after 5 wrong attempts.",
        },
        {
          ar: "التطبيق يمنع النسخ الاحتياطي التلقائي للنظام ويخفي محتواه في قائمة التطبيقات الأخيرة.",
          en: "The app disables system auto-backup and hides its content in the recent-apps screen.",
        },
      ],
    },
    {
      title: { ar: "الاحتفاظ والحذف", en: "Retention and deletion" },
      bullets: [
        {
          ar: "بيانات دفترك تُحذَف بإلغاء تثبيت التطبيق أو بحذف بياناته من إعدادات النظام. نسخ Drive تحذفها من حسابك في Drive.",
          en: "Your ledger is deleted when you uninstall the app or clear its data. Drive backups are deleted from your Drive.",
        },
        {
          ar: "بيانات الاشتراك على خادمنا (البصمة، الاسم، الهاتف، البريد) نحتفظ بها ما دام لك اشتراك أو تجربة، ويمكنك طلب حذفها في أي وقت، وننفّذ الطلب خلال 30 يوماً.",
          en: "Subscription data on our server (fingerprint, name, phone, email) is kept while you have a subscription or trial. You can request its deletion at any time; we complete it within 30 days.",
        },
      ],
    },
    {
      title: { ar: "الأطفال", en: "Children" },
      paragraphs: [
        {
          ar: "التطبيق موجّه لأصحاب المحلات البالغين، ولا نجمع عن قصد بيانات من هم دون 13 عاماً.",
          en: "The app is intended for adult shop owners. We do not knowingly collect data from children under 13.",
        },
      ],
    },
    {
      title: { ar: "التغييرات", en: "Changes" },
      paragraphs: [
        {
          ar: "إن غيّرنا هذه السياسة نُحدّث تاريخها أعلاه، ونُعلمك داخل التطبيق إن كان التغيير جوهرياً.",
          en: "If we change this policy, we update the date above and notify you in the app of material changes.",
        },
      ],
    },
  ],
};

export const privacyPolicies: PrivacyPolicy[] = [daftar];

export function getPrivacyPolicy(product: string): PrivacyPolicy | undefined {
  return privacyPolicies.find((p) => p.product === product);
}
