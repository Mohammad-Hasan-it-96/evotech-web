import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icon";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { localized } from "@/content/types";
import type { CatalogProduct } from "@/lib/catalog";
import type { Locale } from "@/i18n/routing";

export function ProductCard({
  product,
  locale,
}: {
  product: CatalogProduct;
  locale: Locale;
}) {
  const t = useTranslations("common");
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <Card className="group relative h-full overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div
        className="pointer-events-none absolute -end-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-sm">
            <Icon name={product.icon} className="size-6" />
          </div>
          <div>
            <h3 className="font-semibold leading-tight">
              {localized(product.name, locale)}
            </h3>
            <p className="text-xs text-muted-foreground">
              {localized(product.tagline, locale)}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {localized(product.description, locale)}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {product.platforms.map((platform) => (
            <Badge key={platform} variant="secondary" className="font-normal">
              {platform}
            </Badge>
          ))}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {t("viewDetails")}
          <Arrow className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
