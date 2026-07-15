import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { getCatalog, getProduct } from "@/lib/catalog";
import { localized } from "@/content/types";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const products = await getCatalog();
  return routing.locales.flatMap((locale) =>
    products.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: localized(product.name, locale),
    description: localized(product.description, locale),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await getProduct(slug);
  if (!product) notFound();

  const t = await getTranslations();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const Back = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Back className="size-4" />
        {t("nav.products")}
      </Link>

      <Reveal className="mt-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-lg shadow-primary/20">
            <Icon name={product.icon} className="size-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {localized(product.name, locale)}
            </h1>
            <p className="text-lg text-muted-foreground">
              {localized(product.tagline, locale)}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <p className="mt-8 text-lg leading-relaxed text-pretty">
          {localized(product.description, locale)}
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {t("productsPage.platformsLabel")}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.platforms.map((platform) => (
              <Badge key={platform} variant="secondary">
                {platform}
              </Badge>
            ))}
          </div>
        </div>
      </Reveal>

      {product.plans.length > 0 && (
        <Reveal delay={0.15}>
          <div className="mt-12">
            <h2 className="text-xl font-semibold">{t("pricingPage.title")}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {product.plans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col rounded-2xl border bg-card p-6",
                    plan.isPopular
                      ? "border-primary/50 shadow-lg shadow-primary/10"
                      : "border-border/60",
                  )}
                >
                  {plan.isPopular && (
                    <Badge className="absolute -top-3 start-6">
                      {t("pricingPage.popular")}
                    </Badge>
                  )}
                  <h3 className="font-semibold">
                    {localized(plan.name, locale)}
                  </h3>
                  <p className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gradient-brand">
                      {plan.currency} {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {t("pricingPage.perMonth")}
                    </span>
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={localized(feature, locale)}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        {localized(feature, locale)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.2}>
        <div className="mt-12 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium">{t("home.ctaBand.subtitle")}</p>
          <Button asChild size="lg">
            <Link href="/contact">
              {t("common.contactSales")}
              <Arrow className="size-4" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
