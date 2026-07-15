"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { dashboardNav } from "@/features/dashboard/nav";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardOverviewPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { user } = useAuth();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  const cards = dashboardNav.filter((item) => item.key !== "overview");

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          {t("overview.welcome", { name: user?.name ?? "" })}
        </h2>
        <p className="text-muted-foreground">{t("overview.subtitle")}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((item) => (
          <Link key={item.key} href={item.href}>
            <Card className="group h-full border-border/60 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <item.icon className="size-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{t(`nav.${item.key}`)}</h3>
                  <p className="inline-flex items-center gap-1 text-sm text-primary">
                    {t("overview.manage")}
                    <Arrow className="size-3.5" />
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
