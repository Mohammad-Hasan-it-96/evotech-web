"use client";

import * as React from "react";
import { Loader2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import {
  fetchDeviceSubscriptions,
  type DeviceSubscriptionFilters,
} from "@/lib/api/resources";
import type { DeviceSubscription } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActivateDeviceDialog } from "./activate-device-dialog";
import { DeclineDeviceDialog } from "./decline-device-dialog";

/**
 * The operator console for consumer-app devices (SmartAgent, Fawateer).
 *
 * Its job is fulfilling sales: the app files a purchase intent (status
 * "pending") and funnels the user to WhatsApp/Telegram/email, then an operator
 * activates the device here and an FCM push unlocks it live. "Pending" is
 * therefore the default tab — it is the work queue.
 */
export function DevicesScreen() {
  const t = useTranslations("dashboard.devices");

  const [tab, setTab] = React.useState<"pending" | "all">("pending");
  const [search, setSearch] = React.useState("");
  const [query, setQuery] = React.useState("");

  const filters: DeviceSubscriptionFilters = {
    ...(tab === "pending" ? { status: "pending" } : {}),
    ...(query ? { q: query } : {}),
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["device-subscriptions", filters],
    queryFn: () => fetchDeviceSubscriptions(filters),
  });

  const devices = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setQuery(search.trim());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        {isFetching ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-border/60 p-1">
          {(["pending", "all"] as const).map((value) => (
            <Button
              key={value}
              variant={tab === value ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab(value)}
            >
              {t(`tabs.${value}`)}
            </Button>
          ))}
        </div>

        <form onSubmit={onSearch} className="flex flex-1 gap-2 sm:max-w-xs">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
          />
          <Button type="submit" variant="secondary" size="icon" aria-label={t("search")}>
            <Search className="size-4" />
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : devices.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          {tab === "pending" ? t("emptyPending") : t("empty")}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("user")}</TableHead>
                  <TableHead>{t("app")}</TableHead>
                  <TableHead>{t("statusLabel")}</TableHead>
                  <TableHead>{t("requested")}</TableHead>
                  <TableHead>{t("ends")}</TableHead>
                  <TableHead className="text-end">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <DeviceRow key={device.id} device={device} />
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm text-muted-foreground">{t("count", { total })}</p>
        </>
      )}
    </div>
  );
}

function DeviceRow({ device }: { device: DeviceSubscription }) {
  const t = useTranslations("dashboard.devices");
  // Same locale the subscriptions table formats with — without it the two
  // screens render the same date in different calendars for the same operator.
  const locale = useLocale();

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{device.full_name ?? "—"}</div>
        {/* The contact route matters: the app funnels the user to this channel. */}
        <div className="text-xs text-muted-foreground">
          {device.phone ?? "—"}
          {device.contact_method ? ` · ${device.contact_method}` : ""}
        </div>
        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground/70">
          {device.device_id ?? "—"}
        </div>
      </TableCell>

      <TableCell>{device.app_name ?? "—"}</TableCell>

      <TableCell>
        <DeviceStatusBadge device={device} />
      </TableCell>

      <TableCell>
        {device.status === "pending" && device.requested_plan ? (
          <Badge variant="outline">{device.requested_plan}</Badge>
        ) : (
          <span className="text-muted-foreground">{device.plan_id ?? "—"}</span>
        )}
      </TableCell>

      <TableCell>
        {device.expires_at ? (
          <span className={device.is_active ? undefined : "text-destructive"}>
            {new Date(device.expires_at).toLocaleDateString(locale)}
          </span>
        ) : (
          <span className="text-muted-foreground">{t("noEnd")}</span>
        )}
      </TableCell>

      <TableCell className="text-end">
        <div className="flex items-center justify-end gap-1">
          {/* Decline only answers an open request — there is nothing to refuse
              on a device that has not asked for anything. */}
          {device.status === "pending" ? <DeclineDeviceDialog device={device} /> : null}
          <ActivateDeviceDialog device={device} />
        </div>
      </TableCell>
    </TableRow>
  );
}

/**
 * Four states an operator must tell apart: waiting on them, on a trial, paid and
 * live, or lapsed. `is_active` already folds in expiry, so it is the source of
 * truth for "live" rather than the raw is_verified flag.
 */
function DeviceStatusBadge({ device }: { device: DeviceSubscription }) {
  const t = useTranslations("dashboard.devices.status");

  if (device.status === "pending") {
    return <Badge variant="default">{t("pending")}</Badge>;
  }
  if (device.is_trial) {
    return <Badge variant="secondary">{t("trial")}</Badge>;
  }
  if (device.is_active) {
    return <Badge variant="outline">{t("active")}</Badge>;
  }
  // After the access checks, not before. A decline is permanent where "pending"
  // is transient, so a paying customer whose *upgrade* was refused must still
  // read as Active — but a device with no access reads better as "declined" than
  // as "expired", which claims it once had a subscription.
  if (device.status === "declined") {
    return <Badge variant="outline">{t("declined")}</Badge>;
  }

  return <Badge variant="destructive">{t("expired")}</Badge>;
}
