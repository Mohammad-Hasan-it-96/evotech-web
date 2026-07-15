import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/features/services/service-card";
import { ProductCard } from "@/features/products/product-card";
import { services } from "@/content/services";
import { getFeaturedProducts } from "@/lib/catalog";
import type { Locale } from "@/i18n/routing";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const featuredProducts = await getFeaturedProducts();

  const stats = [
    { value: "5+", key: "products" },
    { value: "20+", key: "clients" },
    { value: "99.9%", key: "uptime" },
    { value: "24/7", key: "support" },
  ] as const;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        >
          <div className="absolute start-1/2 top-[-10%] size-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] dark:bg-primary/25" />
          <div className="absolute end-[-5%] top-1/3 size-72 rounded-full bg-brand-2/20 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                {t("hero.badge")}
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                {t("hero.title")}{" "}
                <span className="text-gradient-brand">
                  {t("hero.titleHighlight")}
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
                {t("hero.subtitle")}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/contact">
                    {t("hero.ctaPrimary")}
                    <Arrow className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Link href="/products">{t("hero.ctaSecondary")}</Link>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Stats */}
          <Reveal delay={0.2}>
            <dl className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.key}
                  className="flex flex-col items-center gap-1 bg-background p-6 text-center"
                >
                  <dt className="order-2 text-sm text-muted-foreground">
                    {t(`stats.${stat.key}`)}
                  </dt>
                  <dd className="order-1 text-3xl font-bold text-gradient-brand">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionHeading
            title={t("servicesSection.title")}
            subtitle={t("servicesSection.subtitle")}
          />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service, i) => (
            <Reveal key={service.slug} delay={i * 0.05}>
              <ServiceCard service={service} locale={locale} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Products preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <SectionHeading
            title={t("productsSection.title")}
            subtitle={t("productsSection.subtitle")}
          />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product, i) => (
            <Reveal key={product.slug} delay={i * 0.05}>
              <ProductCard product={product} locale={locale} />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/products">
              {t("productsSection.title")}
              <Arrow className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Why EVOTECH */}
      <WhySection />

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-brand-2/10 px-6 py-14 text-center sm:px-12">
            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              {t("ctaBand.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-pretty">
              {t("ctaBand.subtitle")}
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/contact">
                {t("ctaBand.button")}
                <Arrow className="size-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function WhySection() {
  const t = useTranslations("home.why");
  const items = t.raw("items") as { title: string; description: string }[];
  const icons = ["gauge", "shield", "sparkles", "headset"];

  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05} className="space-y-3">
              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon name={icons[i]} className="size-6" />
              </div>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <CheckCircle2 className="size-4 text-primary" />
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
