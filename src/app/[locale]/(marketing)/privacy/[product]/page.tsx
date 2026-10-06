import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MessageCircle } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPrivacyPolicy, privacyPolicies } from "@/content/privacy-policies";
import { localized } from "@/content/types";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Per-product privacy policy — the public URL a store listing links to
 * (e.g. /ar/privacy/daftar for Google Play). Content lives in
 * src/content/privacy-policies.ts; only page chrome comes from messages.
 */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    privacyPolicies.map((p) => ({ locale, product: p.product })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; product: string }>;
}): Promise<Metadata> {
  const { locale, product } = await params;
  const policy = getPrivacyPolicy(product);
  if (!policy) return {};
  const t = await getTranslations({ locale, namespace: "privacyPage" });
  return {
    title: `${t("title")} — ${localized(policy.productName, locale)}`,
    description: localized(policy.sections[0].paragraphs?.[0] ?? policy.productName, locale),
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: Locale; product: string }>;
}) {
  const { locale, product } = await params;
  setRequestLocale(locale);
  const policy = getPrivacyPolicy(product);
  if (!policy) notFound();

  const t = await getTranslations("privacyPage");
  const updated = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
    new Date(`${policy.updated}T00:00:00Z`),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <SectionHeading
          title={`${t("title")} — ${localized(policy.productName, locale)}`}
          subtitle={t("updated", { date: updated })}
        />
      </Reveal>

      <Card className="mt-12 border-border/60">
        <CardContent className="space-y-10">
          {policy.sections.map((section) => (
            <section key={section.title.en} className="space-y-3">
              <h2 className="text-xl font-semibold">{localized(section.title, locale)}</h2>
              {section.bullets && (
                <ul className="list-disc space-y-2 ps-5 text-muted-foreground">
                  {section.bullets.map((b) => (
                    <li key={b.en} className="text-pretty">
                      {localized(b, locale)}
                    </li>
                  ))}
                </ul>
              )}
              {section.paragraphs?.map((p) => (
                <p key={p.en} className="text-muted-foreground text-pretty">
                  {localized(p, locale)}
                </p>
              ))}
            </section>
          ))}

          <section className="space-y-3 border-t border-border/60 pt-8">
            <h2 className="text-xl font-semibold">{t("contactTitle")}</h2>
            <p className="text-muted-foreground">{t("contactBody")}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <a href={`mailto:${policy.contact.email}`}>
                  <Mail className="size-4" />
                  <span dir="ltr">{policy.contact.email}</span>
                </a>
              </Button>
              <Button asChild variant="outline">
                <a
                  href={`https://wa.me/${policy.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" />
                  <span dir="ltr">+{policy.contact.whatsapp}</span>
                </a>
              </Button>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
