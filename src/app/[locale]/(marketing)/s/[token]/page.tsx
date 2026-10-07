import type { Metadata } from "next";
import { BookOpenCheck, Clock } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/i18n/routing";
import { getSharedStatement } from "@/lib/statements";
import { cn } from "@/lib/utils";

/**
 * A customer statement a shop shared from دفتر حسابات (evotech-core ADR 0013).
 *
 * Rendered per request and never cached (see next.config.ts headers): a revoked or
 * expired link must stop showing the debtor's balance at once. It is not indexed and
 * carries no analytics; the only thing it promotes is the app, at the bottom.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "statementPage" });
  // The customer's name stays out of the title: link previews in WhatsApp show it.
  return {
    title: t("title"),
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

/** Western digits in both locales, matching the app the shop typed the amounts into. */
function formatters(locale: Locale) {
  const tag = locale === "ar" ? "ar-u-nu-latn" : locale;
  return {
    amount: new Intl.NumberFormat(tag, { maximumFractionDigits: 2 }),
    date: new Intl.DateTimeFormat(tag, { dateStyle: "medium" }),
  };
}

function parseDate(value: string): Date | null {
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default async function SharedStatementPage({
  params,
}: {
  params: Promise<{ locale: Locale; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("statementPage");
  const statement = await getSharedStatement(token);

  if (!statement) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <Clock className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">{t("unavailableTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("unavailableBody")}</p>
        <AppPromo label={t("promo")} cta={t("promoCta")} />
      </div>
    );
  }

  const f = formatters(locale);
  const fmtDate = (value: string) => {
    const d = parseDate(value);
    return d ? f.date.format(d) : value;
  };
  const amount = (n: number) => `${f.amount.format(n)} ${statement.currency}`;
  const owes = statement.balance > 0;
  const settled = statement.balance === 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="text-center">
        {statement.shopName && (
          <p className="text-sm font-medium text-primary">{statement.shopName}</p>
        )}
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("customer", { name: statement.customerName })} · {statement.currency}
        </p>
      </header>

      <Card
        className={cn(
          "mt-8 border-2",
          settled ? "border-border/60" : owes ? "border-destructive/40" : "border-primary/40",
        )}
      >
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            {settled ? t("settled") : owes ? t("youOwe") : t("yourCredit")}
          </p>
          {!settled && (
            <p
              className={cn(
                "mt-1 text-3xl font-bold sm:text-4xl",
                owes ? "text-destructive" : "text-primary",
              )}
            >
              {amount(Math.abs(statement.balance))}
            </p>
          )}
          <div className="mt-4 flex justify-center gap-6 text-sm text-muted-foreground">
            <span>
              {t("totalDue")}: <span dir="ltr">{f.amount.format(statement.totalDue)}</span>
            </span>
            <span>
              {t("totalPaid")}: <span dir="ltr">{f.amount.format(statement.totalPaid)}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">{t("entries")}</h2>
        {statement.entries.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t("noEntries")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/60 rounded-2xl border border-border/60">
            {statement.entries.map((e, i) => (
              <li key={i} className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {e.direction === "paid" ? t("paid") : t("due")}
                  </p>
                  <p className="text-xs text-muted-foreground">{fmtDate(e.date)}</p>
                  {e.note && (
                    <p className="mt-1 break-words text-sm text-muted-foreground">{e.note}</p>
                  )}
                </div>
                <p
                  className={cn(
                    "shrink-0 font-semibold",
                    e.direction === "paid" ? "text-primary" : "text-foreground",
                  )}
                  dir="ltr"
                >
                  {e.direction === "paid" ? "−" : "+"}
                  {f.amount.format(e.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t("frozen", {
          generated: fmtDate(statement.generatedAt),
          expires: fmtDate(statement.expiresAt),
        })}
      </p>

      <AppPromo label={t("promo")} cta={t("promoCta")} />
    </div>
  );
}

function AppPromo({ label, cta }: { label: string; cta: string }) {
  return (
    <div className="mt-12 rounded-2xl border border-border/60 bg-muted/30 p-6 text-center">
      <BookOpenCheck className="mx-auto size-6 text-primary" />
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
      <Button asChild className="mt-4" variant="secondary">
        <Link href="/products/ledger">{cta}</Link>
      </Button>
    </div>
  );
}
