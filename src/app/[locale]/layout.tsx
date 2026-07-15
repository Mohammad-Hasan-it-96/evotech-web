import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { routing, localeDirection, type Locale } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL("https://evotech.example"),
    title: {
      default: t("defaultTitle"),
      template: `%s · ${t("siteName")}`,
    },
    description: t("description"),
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      title: t("defaultTitle"),
      description: t("description"),
      locale,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const dir = localeDirection[locale as Locale];

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full`}
    >
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
