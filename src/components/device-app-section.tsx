import { Check, Download, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import type { DeviceApp } from "@/content/device-apps";
import { localized } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { getDeviceDownload, getDevicePlans } from "@/lib/device-apps";
import { cn } from "@/lib/utils";

/**
 * The installable-app part of a product page: download, Free vs Pro, and the
 * live device plans (not the Products catalog's company plans).
 */
export async function DeviceAppSection({ app, locale }: { app: DeviceApp; locale: Locale }) {
  const t = await getTranslations("deviceApp");
  const download = await getDeviceDownload(app.apiSlug);

  return (
    <div className="mt-10 space-y-12">
      <Reveal delay={0.05}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {download.url ? (
            <Button asChild size="lg">
              <a href={download.url} rel="noopener">
                <Download className="size-4" />
                {t("download")}
              </a>
            </Button>
          ) : (
            download.supportWhatsApp && (
              <Button asChild size="lg">
                <a
                  href={`https://wa.me/${download.supportWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" />
                  {t("comingSoon")}
                </a>
              </Button>
            )
          )}
          {download.version && (
            <span className="text-sm text-muted-foreground">
              {t("version", { version: download.version })}
            </span>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FeatureCard
            title={t("freeTitle")}
            subtitle={t("freeSubtitle")}
            items={app.free.map((f) => localized(f, locale))}
          />
          <FeatureCard
            title={t("proTitle")}
            subtitle={t("proSubtitle")}
            items={app.pro.map((f) => localized(f, locale))}
            highlight
          />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div>
          <h2 className="text-xl font-semibold">{t("plansTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("trial", { days: app.trialDays })}
          </p>
          <div className="mt-5">
            <DeviceAppPlans app={app} locale={locale} />
          </div>
          <div className="mt-6 rounded-2xl border border-border/60 p-5">
            <h3 className="text-sm font-semibold">{t("paymentTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              {localized(app.payment, locale)}
            </p>
          </div>
          <Link
            href={`/privacy/${app.privacySlug}`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShieldCheck className="size-4" />
            {t("privacy")}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}

function FeatureCard({
  title,
  subtitle,
  items,
  highlight = false,
}: {
  title: string;
  subtitle: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-card p-6",
        highlight ? "border-primary/50 shadow-lg shadow-primary/10" : "border-border/60",
      )}
    >
      <h3 className="flex items-center gap-2 font-semibold">
        {highlight && <Sparkles className="size-4 text-primary" />}
        {title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <ul className="mt-5 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The live device plan cards — shared by the product page and /pricing. */
export async function DeviceAppPlans({ app, locale }: { app: DeviceApp; locale: Locale }) {
  const t = await getTranslations("deviceApp");
  const { currencySymbol, plans } = await getDevicePlans(app.apiSlug);

  if (plans.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("plansUnavailable")}</p>;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const price = plan.priceAfterDiscount ?? plan.price;
        return (
          <div
            key={plan.id}
            className={cn(
              "relative flex h-full flex-col rounded-2xl border bg-card p-6",
              plan.recommended ? "border-primary/50 shadow-lg shadow-primary/10" : "border-border/60",
            )}
          >
            {plan.recommended && (
              <Badge className="absolute -top-3 start-6">{t("recommended")}</Badge>
            )}
            <h3 className="font-semibold">{t("duration", { months: plan.durationMonths })}</h3>
            {locale === "ar" && plan.title && (
              <p className="text-sm text-muted-foreground">{plan.title}</p>
            )}
            <p className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gradient-brand" dir="ltr">
                {currencySymbol}
                {price}
              </span>
              {plan.priceAfterDiscount !== null && plan.priceAfterDiscount < plan.price && (
                <span className="text-sm text-muted-foreground line-through" dir="ltr">
                  {currencySymbol}
                  {plan.price}
                </span>
              )}
            </p>
            {locale === "ar" && plan.description && (
              <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
