import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { getCatalog } from "@/lib/catalog";
import { localized } from "@/content/types";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricingPage" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricingPage");
  const products = await getCatalog();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
      </Reveal>

      <div className="mt-14 space-y-14">
        {products.map((product) => (
          <Reveal key={product.slug}>
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold tracking-tight">
                  {localized(product.name, locale)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {localized(product.tagline, locale)}
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {product.plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative flex h-full flex-col rounded-2xl border bg-card p-6",
                      plan.isPopular
                        ? "border-primary/50 shadow-lg shadow-primary/10"
                        : "border-border/60",
                    )}
                  >
                    {plan.isPopular && (
                      <Badge className="absolute -top-3 start-6">
                        {t("popular")}
                      </Badge>
                    )}
                    <h3 className="font-semibold">
                      {localized(plan.name, locale)}
                    </h3>
                    <p className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {plan.currency} {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t("perMonth")}
                      </span>
                    </p>
                    <ul className="mt-5 flex-1 space-y-2.5">
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
                    <Button
                      asChild
                      variant={plan.isPopular ? "default" : "outline"}
                      className="mt-6 w-full"
                    >
                      <Link href="/contact">{t("cta")}</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <p className="mt-12 text-center text-xs text-muted-foreground">
        {t("note")}
      </p>
    </div>
  );
}
