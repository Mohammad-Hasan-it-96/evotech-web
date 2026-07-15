import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "@/features/contact/contact-form";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  return { title: t("title"), description: t("subtitle") };
}

const contactInfo = [
  { icon: Mail, value: "info@evotech.example", dir: "ltr" as const },
  { icon: Phone, value: "+963 900 000 000", dir: "ltr" as const },
  { icon: MapPin, value: "Syria", dir: "auto" as const },
];

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contactPage");

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <SectionHeading
          title={t("title")}
          subtitle={t("subtitle")}
          align="start"
          className="mx-0"
        />
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">{t("infoTitle")}</h2>
            <ul className="space-y-4">
              {contactInfo.map((item) => (
                <li key={item.value} className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </span>
                  <span dir={item.dir} className="text-muted-foreground">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
