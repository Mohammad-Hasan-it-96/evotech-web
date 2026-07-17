"use client";

import * as React from "react";
import { Loader2, Zap } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  activateDeviceSubscription,
  fetchDevicePlans,
} from "@/lib/api/resources";
import type { DeviceSubscription } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Fulfils a sale: activates (or extends) a device on a plan.
 *
 * Plans come from the platform's own catalog rather than free text, so the
 * operator cannot type a plan id the device would not recognise — an unknown id
 * yields a zero-month term, i.e. an instantly-expired subscription for someone
 * who has just paid.
 */
export function ActivateDeviceDialog({ device }: { device: DeviceSubscription }) {
  const t = useTranslations("dashboard.devices.activate");
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [planId, setPlanId] = React.useState("");

  // Keyed by app: plans are per-app, so a cache shared across apps would offer
  // one app's plan ids while activating another's device.
  const { data } = useQuery({
    queryKey: ["device-plans", device.app_name],
    queryFn: () => fetchDevicePlans(device.app_name),
    enabled: open,
  });

  const plans = (data?.data.plans ?? []).filter((plan) => plan.enabled);
  const currency = data?.data.currency;

  // Default to what the user actually asked for, so the common case is one click.
  // Derived rather than synced through an effect: the selection is just "what the
  // operator picked, else the requested plan once the catalog confirms it exists".
  const requested = plans.find((plan) => plan.id === device.requested_plan);
  const selected = planId || requested?.id || "";

  const activate = useMutation({
    mutationFn: () => activateDeviceSubscription(device.id, selected),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["device-subscriptions"] });
      toast.success(t("done"));
      setOpen(false);
      setPlanId("");
    },
    onError: () => toast.error(t("failed")),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={device.status === "pending" ? "default" : "outline"}>
          <Zap className="size-4" />
          {device.is_active ? t("extend") : t("activate")}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <div className="font-medium">{device.full_name ?? "—"}</div>
            <div className="text-muted-foreground">
              {device.phone ?? "—"}
              {device.contact_method ? ` · ${device.contact_method}` : ""}
            </div>
            <div className="mt-1 font-mono text-[11px] text-muted-foreground/70">
              {device.app_name} · {device.device_id}
            </div>
          </div>

          {device.requested_plan ? (
            <p className="text-sm text-muted-foreground">
              {t("requested", { plan: device.requested_plan })}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label>{t("plan")}</Label>
            <Select value={selected} onValueChange={setPlanId}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectPlan")} />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.title} — {currency?.symbol ?? ""}
                    {plan.price_after_discount ?? plan.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => activate.mutate()}
            disabled={!selected || activate.isPending}
          >
            {activate.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
