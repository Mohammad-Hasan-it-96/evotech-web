import type { Metadata } from "next";
import { Target, Eye, Gem } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage");
  const values = t.raw("values") as { title: string; description: string }[];
  const valueIcons = [Gem, Eye, Target];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
      </Reveal>

      {/* Mission & Vision */}
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <Reveal>
          <Card className="h-full border-border/60 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="space-y-3">
              <Target className="size-8 text-primary" />
              <h2 className="text-xl font-semibold">{t("missionTitle")}</h2>
              <p className="text-muted-foreground text-pretty">
                {t("mission")}
              </p>
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.06}>
          <Card className="h-full border-border/60 bg-gradient-to-br from-brand-2/5 to-transparent">
            <CardContent className="space-y-3">
              <Eye className="size-8 text-primary" />
              <h2 className="text-xl font-semibold">{t("visionTitle")}</h2>
              <p className="text-muted-foreground text-pretty">{t("vision")}</p>
            </CardContent>
          </Card>
        </Reveal>
      </div>

      {/* Values */}
      <div className="mt-20">
        <Reveal>
          <h2 className="text-center text-2xl font-bold tracking-tight">
            {t("valuesTitle")}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {values.map((value, i) => {
            const ValueIcon = valueIcons[i] ?? Gem;
            return (
              <Reveal key={value.title} delay={i * 0.06} className="space-y-3">
                <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <ValueIcon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold">{value.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
