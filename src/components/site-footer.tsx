import { useLocale, useTranslations } from "next-intl";
import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { catalogFallback } from "@/content/catalog-fallback";
import { localized } from "@/content/types";
import type { Locale } from "@/i18n/routing";

export function SiteFooter() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const year = 2026;

  return (
    <footer className="mt-24 border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            {t("footer.tagline")}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">
            {t("footer.productsTitle")}
          </h3>
          <ul className="space-y-2.5 text-sm">
            {catalogFallback.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/products/${p.slug}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {localized(p.name, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">
            {t("footer.companyTitle")}
          </h3>
          <ul className="space-y-2.5 text-sm">
            {(["services", "pricing", "about", "contact"] as const).map(
              (key) => (
                <li key={key}>
                  <Link
                    href={`/${key}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">
            {t("footer.contactTitle")}
          </h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 text-primary" />
              <span dir="ltr">info@evotech.example</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 text-primary" />
              <span dir="ltr">+963 900 000 000</span>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 text-primary" />
              <span>Syria</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          © {year} EVOTECH. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
