"use client";

import { Check, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { fetchProducts } from "@/lib/api/resources";
import { Icon } from "@/components/icon";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pickText } from "../helpers";

export function ProductsScreen() {
  const t = useTranslations("dashboard.productsList");
  const locale = useLocale();
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const products = data?.data ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>

      {isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {products.map((product) => (
            <Card key={product.id} className="border-border/60">
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-white">
                    <Icon name={product.icon} className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {pickText(product.name, locale)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {pickText(product.tagline, locale)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {t("plans")}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {product.plans.map((plan) => (
                      <div
                        key={plan.id}
                        className="rounded-lg border border-border/60 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {pickText(plan.name, locale)}
                          </span>
                          {plan.is_popular && (
                            <Badge className="text-[10px]">{t("popular")}</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-lg font-bold text-gradient-brand">
                          {plan.currency} {plan.price}
                          <span className="text-xs font-normal text-muted-foreground">
                            {" "}
                            {t("perMonth")}
                          </span>
                        </p>
                        <ul className="mt-2 space-y-1">
                          {plan.features.map((f, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground"
                            >
                              <Check className="size-3 text-primary" />
                              {pickText(f, locale)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
