"use client";

import * as React from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { fetchDeviceApps, fetchDeviceCatalogPlans } from "@/lib/api/resources";
import type { DeviceApp, DeviceCatalogPlan } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppSettingsDialog } from "./app-settings-dialog";
import { DeletePlanDialog } from "./delete-plan-dialog";
import { PlanFormDialog } from "./plan-form-dialog";
import { RemoteConfigDialog } from "./remote-config-dialog";

/**
 * The pricing editor for the consumer apps. These plans used to live in a PHP
 * config file, so changing a price meant a deploy.
 *
 * Two scopes, and the distinction is load-bearing. The **shared** catalog is what
 * the un-namespaced `/api/getPlans` serves — that endpoint carries no app name, so
 * it cannot resolve an app, and the builds still pointed at it depend on this list.
 * An app can instead sell **its own** catalog, addressed through `/api/{slug}`.
 */
export function PlansScreen() {
  const t = useTranslations("dashboard.plans");

  // null = the shared catalog. Also the default: it is the list serving the
  // builds currently in customers' hands.
  const [appId, setAppId] = React.useState<string | null>(null);

  const { data: appsData, isLoading: loadingApps } = useQuery({
    queryKey: ["device-apps"],
    queryFn: fetchDeviceApps,
  });

  const apps = appsData?.data ?? [];
  const selectedApp = apps.find((app) => app.id === appId) ?? null;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["device-plans", appId],
    queryFn: () => fetchDeviceCatalogPlans(appId),
  });

  const plans = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        {isFetching ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 p-1">
          <Button
            variant={appId === null ? "default" : "ghost"}
            size="sm"
            onClick={() => setAppId(null)}
          >
            {t("shared")}
          </Button>
          {apps.map((app) => (
            <Button
              key={app.id}
              variant={appId === app.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setAppId(app.id)}
            >
              {app.label}
            </Button>
          ))}
        </div>

        <div className="ms-auto flex items-center gap-2">
          {selectedApp ? <RemoteConfigDialog app={selectedApp} /> : null}
          {selectedApp ? <AppSettingsDialog app={selectedApp} /> : null}
          <PlanFormDialog appId={appId} />
        </div>
      </div>

      <ScopeNotice app={selectedApp} />

      {loadingApps || isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : plans.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("plan")}</TableHead>
                <TableHead>{t("duration")}</TableHead>
                <TableHead>{t("price")}</TableHead>
                <TableHead>{t("statusLabel")}</TableHead>
                <TableHead className="text-end">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <PlanRow key={plan.id} plan={plan} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

/**
 * Warns when the plans on screen are not the ones the app is actually selling.
 *
 * Without this an operator can carefully price an app's own catalog, see it saved,
 * and never realise the app is still serving the shared list — the edit appears to
 * work and changes nothing a customer sees.
 */
function ScopeNotice({ app }: { app: DeviceApp | null }) {
  const t = useTranslations("dashboard.plans");

  if (app === null || !app.uses_shared_plans) {
    return null;
  }

  // Amber rather than muted: this says the work on screen is inert, which is not
  // the same kind of statement as the hints it used to sit alongside. Styled as
  // one of them, it was read as one of them and missed.
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <span>{t("readsSharedNotice", { app: app.label })}</span>
    </div>
  );
}

function PlanRow({ plan }: { plan: DeviceCatalogPlan }) {
  const t = useTranslations("dashboard.plans");

  const discounted =
    plan.price_after_discount !== null && plan.price_after_discount !== plan.price;

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{plan.title}</div>
        {plan.description ? (
          <div className="text-xs text-muted-foreground">{plan.description}</div>
        ) : null}
        {/* The key is what the app sends back and what device rows store, so it
            is worth showing next to the human title. */}
        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground/70">
          {plan.key}
        </div>
      </TableCell>

      <TableCell>{t("monthsValue", { count: plan.duration_months })}</TableCell>

      <TableCell>
        {discounted ? (
          <span className="flex items-center gap-2">
            <span className="text-muted-foreground line-through">{plan.price}</span>
            <span className="font-medium">{plan.price_after_discount}</span>
          </span>
        ) : (
          <span>{plan.price}</span>
        )}
      </TableCell>

      <TableCell>
        <div className="flex flex-wrap gap-1">
          {plan.enabled ? (
            <Badge variant="outline">{t("enabled")}</Badge>
          ) : (
            <Badge variant="destructive">{t("disabled")}</Badge>
          )}
          {plan.recommended ? (
            <Badge variant="secondary">{t("recommended")}</Badge>
          ) : null}
        </div>
      </TableCell>

      <TableCell className="text-end">
        <div className="flex items-center justify-end gap-1">
          <PlanFormDialog plan={plan} />
          <DeletePlanDialog plan={plan} />
        </div>
      </TableCell>
    </TableRow>
  );
}
