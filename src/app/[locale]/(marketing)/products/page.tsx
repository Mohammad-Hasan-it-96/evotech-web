import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { ProductCard } from "@/features/products/product-card";
import { getCatalog } from "@/lib/catalog";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "productsPage" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("productsPage");
  const products = await getCatalog();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
      </Reveal>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, i) => (
          <Reveal key={product.slug} delay={i * 0.05}>
            <ProductCard product={product} locale={locale} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
